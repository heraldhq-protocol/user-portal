"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";

export function useSolBalance() {
	const { connection } = useConnection();
	const { publicKey } = useWallet();

	const checkAndAirdrop = useCallback(
		async (minBalance = 0.01) => {
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
				return false;
			}
			return true;
		},
		[connection, publicKey]
	);

	return { checkAndAirdrop };
}
