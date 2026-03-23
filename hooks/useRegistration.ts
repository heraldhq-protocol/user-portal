"use client";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
// import { deriveIdentityPDA, buildRegisterIdentityTx } from '@/lib/anchor';
// import { encryptEmailForWallet } from '@/lib/encryption';
import type { RegistrationStep } from "@/types";

type RegistrationPhase = 0 | 1 | 2 | 3 | 4 | 5;

type RegistrationState = {
	step: RegistrationStep;
	email: string;
	optIns: { defi: boolean; governance: boolean; system: boolean; marketing: boolean };
	digestMode: boolean;
	txSignature: string | null;
	error: string | null;
};

type UseRegistrationReturn = {
	state: RegistrationState;
	isRegistering: boolean;
	isRegistered: boolean;
	setEmail: (email: string) => void;
	setOptIns: (optIns: RegistrationState["optIns"]) => void;
	setDigestMode: (v: boolean) => void;
	goToStep: (step: RegistrationStep) => void;
	register: () => Promise<void>;
	phase: number;
};

// MOCK MODE: Set to false when ready for real blockchain
const MOCK_MODE = true;

export function useRegistration(): UseRegistrationReturn {
	const wallet = useWallet();
	const [phase, setPhase] = useState<RegistrationPhase>(0);
	const { publicKey } = wallet;
	// const { publicKey, signTransaction } = wallet;
	// const { connection } = useConnection();

	const [state, setState] = useState<RegistrationState>({
		step: "connect",
		email: "",
		optIns: { defi: true, governance: true, system: true, marketing: false },
		digestMode: false,
		txSignature: null,
		error: null,
	});

	const [isRegistering, setIsRegistering] = useState(false);

	// Check if wallet is already registered
	const { data: isRegistered = false } = useQuery({
		queryKey: ["registrationStatus", publicKey?.toBase58()],
		queryFn: async () => {
			if (!publicKey) return false;

			// MOCK: Always return false
			return false;

			/* REAL IMPLEMENTATION:
      const [pda] = deriveIdentityPDA(publicKey);
      const account = await connection.getAccountInfo(pda);
      return account !== null;
      */
		},
		enabled: !!publicKey,
		staleTime: 30000,
	});

	const setEmail = (email: string) => setState((s) => ({ ...s, email }));
	const setOptIns = (optIns: RegistrationState["optIns"]) => setState((s) => ({ ...s, optIns }));
	const setDigestMode = (v: boolean) => setState((s) => ({ ...s, digestMode: v }));
	const goToStep = (step: RegistrationStep) => setState((s) => ({ ...s, step, error: null }));

	const register = async () => {
		if (!publicKey) {
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
			// MOCK MODE (Active)
			await runMockRegistration();

			/* REAL IMPLEMENTATION (Commented out):
      await runRealRegistration();
      */
		} catch (err: unknown) {
			handleRegistrationError(err);
		} finally {
			setIsRegistering(false);
		}
	};

	// MOCK REGISTRATION (Active)
	async function runMockRegistration() {
		const steps = [
			{ phase: 1, delay: 400, message: "Encrypting email..." },
			{ phase: 2, delay: 600, message: "Building transaction..." },
			{ phase: 3, delay: 800, message: "Awaiting signature..." },
			{ phase: 4, delay: 1200, message: "Recording on-chain..." },
			{ phase: 5, delay: 600, message: "Finalizing..." },
		];

		for (const step of steps) {
			await delay(step.delay);
			setPhase(step.phase as RegistrationPhase);
		}

		const mockSignature = generateMockSignature();
		setState((s) => ({
			...s,
			txSignature: mockSignature,
			step: "success",
		}));
	}

	/* REAL REGISTRATION (Commented out):
  async function runRealRegistration() {
    // 1. Encrypt email
    const { encryptedEmail, nonce } = encryptEmailForWallet(state.email, publicKey!.toBytes());
    setPhase(1);

    // 2. Build transaction
    const tx = await buildRegisterIdentityTx(
      connection,
      wallet,
      encryptedEmail,
      nonce,
      state.optIns,
      state.digestMode,
    );
    setPhase(2);

    // 3. Sign transaction
    const signedTx = await signTransaction!(tx);
    setPhase(3);

    // 4. Send raw transaction
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    setPhase(4);

    // 5. Confirm transaction
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      'confirmed',
    );
    setPhase(5);

    setState((s) => ({ ...s, txSignature: signature, step: 'success' }));
  }
  */

	function handleRegistrationError(err: unknown) {
		console.error("Registration error:", err);
		let errorMsg = "An unexpected error occurred. Please try again.";

		if (err instanceof Error) {
			if (
				err.message.includes("User rejected the request") ||
				err.name === "WalletSignTransactionError"
			) {
				errorMsg = "You rejected the transaction. Please try again.";
			} else if (err.message.includes("timeout")) {
				errorMsg = "Transaction timed out. Please try again.";
			}
		}

		setState((s) => ({ ...s, error: errorMsg, step: "encrypt" }));
	}

	return {
		state,
		isRegistering,
		isRegistered,
		setEmail,
		setOptIns,
		setDigestMode,
		goToStep,
		register,
		phase,
	};
}

// Helper functions
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockSignature(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "mock_";
	for (let i = 0; i < 44; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}
