"use client";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SolanaCluster, UserClient, encryptEmail, hashEmail } from "@herald-protocol/sdk";
import { Transaction } from "@solana/web3.js";
import type { RegistrationStep } from "@/types";
import { useWalletRegistrationStatus } from "./useWalletRegistrationStatus";
import { useSolBalance } from "./useSolBalance";
import { fetchApi } from "@/lib/api";

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
	const { publicKey, signTransaction } = wallet;
	const { connection } = useConnection();
	const { checkAndAirdrop } = useSolBalance();

	const [state, setState] = useState<RegistrationState>({
		step: "connect",
		email: "",
		optIns: { optInAll: true, defi: true, governance: true, marketing: false },
		digestMode: false,
		txSignature: null,
		error: null,
	});

	const [isRegistering, setIsRegistering] = useState(false);

	const { data: registrationStatus, isLoading: isCheckingStatus } = useWalletRegistrationStatus();

	const isRegistered = registrationStatus?.registered ?? false;

	// ─── Skip-if-registered (REMOVED: Handled in Wizard for better transitions) ─────────────────

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
			// 2. Check SOL balance before proceeding (airdrop on testnets if needed)
			await checkAndAirdrop(0.01);

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

		// Best-effort sync email hash to backend database.
		// May fail if user doesn't have a JWT yet — that's OK,
		// the hash will be synced on next email update or login.
		try {
			await fetchApi("/portal/email", {
				method: "PATCH",
				body: JSON.stringify({ email: state.email }),
			});
		} catch {
			// Non-critical: email hash sync will happen on next login/update
		}

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
				// Go to login step so they acquire their JWT portal token
				setState((s) => ({
					...s,
					txSignature: "already-registered",
					step: "login",
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
