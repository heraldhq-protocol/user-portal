"use client";

import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import {
	CoinbaseWalletAdapter,
	LedgerWalletAdapter,
	PhantomWalletAdapter,
	SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { type SolanaCluster } from "@herald-protocol/sdk";

export function WalletConnection({ children }: Readonly<{ children: React.ReactNode }>) {
	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter(),
			new CoinbaseWalletAdapter(),
			new LedgerWalletAdapter(),
		],
		[]
	);

	// Clean the environment variable (handle quotes or extra whitespace)
	const customRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
	const rawCluster = process.env.NEXT_PUBLIC_RPC_CLUSTER || "devnet";
	const cluster = rawCluster.replace(/['"]+/g, "").trim() as SolanaCluster;

	const endpoint = useMemo(() => {
		if (customRpcUrl) return customRpcUrl.replace(/['"]+/g, "").trim();
		if (cluster === "localnet") return "http://127.0.0.1:8899";
		return clusterApiUrl(cluster as "devnet" | "mainnet-beta" | "testnet");
	}, [cluster, customRpcUrl]);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>{children}</WalletProvider>
		</ConnectionProvider>
	);
}
