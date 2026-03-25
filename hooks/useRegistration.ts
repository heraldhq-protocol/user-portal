"use client";
import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { SolanaCluster, UserClient, encryptEmail, hashEmail } from "@herald-protocol/sdk";
import { Transaction } from "@solana/web3.js";
import type { RegistrationStep } from "@/types";

type RegistrationPhase = 0 | 1 | 2 | 3 | 4 | 5;

type RegistrationState = {
	step: RegistrationStep;
	email: string;
	optIns: { optInAll: boolean; defi: boolean; governance: boolean; marketing: boolean };
	digestMode: boolean;
	txSignature: string | null;
	error: string | null;
};

type UseRegistrationReturn = {
	state: RegistrationState;
	isRegistering: boolean;
	isRegistered: boolean;
	isCheckingStatus: boolean;
	setEmail: (email: string) => void;
	setOptIns: (optIns: RegistrationState["optIns"]) => void;
	setDigestMode: (v: boolean) => void;
	goToStep: (step: RegistrationStep) => void;
	register: () => Promise<void>;
	phase: number;
};

export function useRegistration(): UseRegistrationReturn {
	const wallet = useWallet();
	const [phase, setPhase] = useState<RegistrationPhase>(0);
	const { publicKey, signMessage, signTransaction } = wallet;
	const { token, login } = useAuth();
	const { connection } = useConnection();

	const [state, setState] = useState<RegistrationState>({
		step: "connect",
		email: "",
		optIns: { optInAll: true, defi: true, governance: true, marketing: false },
		digestMode: false,
		txSignature: null,
		error: null,
	});

	const [isRegistering, setIsRegistering] = useState(false);

	// ─── Check if wallet is already registered on-chain ───────────────────────
	// Uses the public GET /portal/identity/:wallet endpoint (no JWT required).
	const { data: registrationStatus, isLoading: isCheckingStatus } = useQuery({
		queryKey: ["registrationStatus", publicKey?.toBase58()],
		queryFn: async () => {
			if (!publicKey) return { registered: false };

			try {
				const response = await apiFetch(`/portal/identity/${publicKey.toBase58()}`, {
					method: "GET",
				});
				if (response.ok) {
					const data = await response.json();
					return { registered: data.registered === true };
				}
				return { registered: false };
			} catch (e) {
				console.error("Failed to fetch registration status", e);
				return { registered: false };
			}
		},
		enabled: !!publicKey,
		staleTime: 30_000,
	});

	const isRegistered = registrationStatus?.registered ?? false;

	// ─── Skip-if-registered ────────────────────────────────────────────────────
	// When the wallet is already on-chain, fast-forward to the success screen.
	useEffect(() => {
		if (isRegistered && (state.step === "connect" || state.step === "email")) {
			setState((s) => ({
				...s,
				step: "success",
				txSignature: "already-registered",
			}));
		}
	}, [isRegistered, state.step]);

	// ─── State helpers ─────────────────────────────────────────────────────────
	const setEmail = (email: string) => setState((s) => ({ ...s, email }));
	const setOptIns = (optIns: RegistrationState["optIns"]) => setState((s) => ({ ...s, optIns }));
	const setDigestMode = (v: boolean) => setState((s) => ({ ...s, digestMode: v }));
	const goToStep = (step: RegistrationStep) => setState((s) => ({ ...s, step, error: null }));

	// ─── Registration entry point ──────────────────────────────────────────────
	const register = async () => {
		if (!publicKey || !signTransaction) {
			setState((s) => ({
				...s,
				error: "Wallet not connected. Please connect your wallet.",
				step: "connect",
			}));
			return;
		}

		setIsRegistering(true);
		setState((s) => ({ ...s, step: "encrypt", error: null }));
		setPhase(0);

		try {
			// Ensure we have a portal JWT before we start.
			// If not, trigger the sign-in message prompt first.
			if (!token) {
				if (!signMessage) {
					throw new Error(
						"Wallet does not support message signing. Please use a different wallet."
					);
				}
				await login();
			}

			await runRegistration();
		} catch (err: unknown) {
			handleRegistrationError(err);
		} finally {
			setIsRegistering(false);
		}
	};

	// ─── Real on-chain registration ────────────────────────────────────────────
	async function runRegistration() {
		if (!publicKey || !signTransaction) {
			throw new Error("Wallet not connected or does not support signing");
		}

		// Phase 1 — encrypt email (happens in-browser)
		const { encryptedEmail, nonce } = await Promise.resolve(encryptEmail(state.email, publicKey));
		const emailHashBytes = await Promise.resolve(hashEmail(state.email));
		setPhase(1);

		// Phase 2 — build the Solana instruction
		const userClient = new UserClient({
			cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as SolanaCluster) || "devnet",
			rpcUrl: connection.rpcEndpoint,
		});
		const ix = await userClient.registerIdentity({
			owner: publicKey,
			encryptedEmail,
			emailHash: emailHashBytes,
			nonce,
			optIns: {
				optInAll: state.optIns.optInAll,
				optInDefi: state.optIns.defi,
				optInGovernance: state.optIns.governance,
				optInMarketing: state.optIns.marketing,
			},
			digestMode: state.digestMode,
		});

		const latestBlockhash = await connection.getLatestBlockhash("confirmed");
		const tx = new Transaction({
			feePayer: publicKey,
			blockhash: latestBlockhash.blockhash,
			lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
		}).add(ix);
		setPhase(2);

		// Phase 3 — wallet signs the transaction
		const signedTx = await signTransaction(tx);
		setPhase(3);

		// Phase 4 — broadcast to the network
		const signature = await connection.sendRawTransaction(signedTx.serialize(), {
			skipPreflight: false,
			preflightCommitment: "confirmed",
		});
		setPhase(4);

		// Phase 5 — wait for confirmation
		await connection.confirmTransaction(
			{
				signature,
				blockhash: latestBlockhash.blockhash,
				lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
			},
			"confirmed"
		);
		setPhase(5);

		setState((s) => ({ ...s, txSignature: signature, step: "success" }));
	}

	// ─── Error handler ─────────────────────────────────────────────────────────
	function handleRegistrationError(err: unknown) {
		console.error("Registration error:", err);
		let errorMsg = "An unexpected error occurred. Please try again.";

		if (err instanceof Error) {
			if (err.message.includes("User rejected") || err.name === "WalletSignTransactionError") {
				errorMsg = "You rejected the transaction. Please try again.";
			} else if (err.message.includes("timeout")) {
				errorMsg = "Transaction timed out. Please try again.";
			} else if (err.message.includes("message signing")) {
				errorMsg = err.message;
			} else if (err.message.includes("already in use")) {
				// PDA already exists — wallet is already registered.
				setState((s) => ({
					...s,
					txSignature: "already-registered",
					step: "success",
				}));
				return;
			}
		}

		setState((s) => ({ ...s, error: errorMsg, step: "encrypt" }));
	}

	return {
		state,
		isRegistering,
		isRegistered,
		isCheckingStatus,
		setEmail,
		setOptIns,
		setDigestMode,
		goToStep,
		register,
		phase,
	};
}
