"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

/** Minimum SOL required to cover account rent + transaction fees for registration. */
export const MIN_REGISTRATION_SOL = 0.005;
const MIN_REGISTRATION_LAMPORTS = MIN_REGISTRATION_SOL * 1e9;

export function useSolBalance() {
	const { connection } = useConnection();
	const { publicKey } = useWallet();

	const { data: balanceLamports, isLoading: isLoadingBalance } = useQuery({
		queryKey: ["solBalance", publicKey?.toBase58()],
		queryFn: () => connection.getBalance(publicKey!),
		enabled: !!publicKey,
		staleTime: 15_000,
		refetchInterval: 30_000,
	});

	const balanceSol = balanceLamports != null ? balanceLamports / 1e9 : null;

	// null while still loading, true/false once we have a reading
	const hasSufficientBalance =
		balanceLamports != null ? balanceLamports >= MIN_REGISTRATION_LAMPORTS : null;

	const checkAndAirdrop = useCallback(
		async (minBalance = MIN_REGISTRATION_SOL) => {
			if (!publicKey) return false;

			const balance = await connection.getBalance(publicKey);
			const minLamports = minBalance * 1e9;

			if (balance < minLamports) {
				const rawCluster = process.env.NEXT_PUBLIC_RPC_CLUSTER || "devnet";
				const cluster = rawCluster.replace(/['"]+/g, "").trim();

				if (cluster === "localnet" || cluster === "devnet") {
					console.log(`Low balance (${balance / 1e9} SOL). Requesting airdrop on ${cluster}...`);
					try {
						const sig = await connection.requestAirdrop(publicKey, 1 * 1e9);
						await connection.confirmTransaction(sig, "confirmed");
						return true;
					} catch (err) {
						console.warn("Airdrop request failed:", err);
						return false;
					}
				}
				// Mainnet — cannot airdrop, signal insufficient balance
				return false;
			}
			return true;
		},
		[connection, publicKey]
	);

	return { checkAndAirdrop, balanceSol, isLoadingBalance, hasSufficientBalance };
}
