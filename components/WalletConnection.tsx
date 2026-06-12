"use client";

import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
	CoinbaseWalletAdapter,
	LedgerWalletAdapter,
	PhantomWalletAdapter,
	SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { type SolanaCluster } from "@herald-protocol/sdk";
import { IframeWalletAdapter } from "@/lib/iframe-wallet-adapter";

export function WalletConnection({ children }: Readonly<{ children: React.ReactNode }>) {
	// Clean the environment variable (handle quotes or extra whitespace)
	const customRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
	const rawCluster = process.env.NEXT_PUBLIC_RPC_CLUSTER || "devnet";
	const cluster = rawCluster.replace(/['"]+/g, "").trim() as SolanaCluster;

	const wallets = useMemo(
		() => {
			if (typeof window !== "undefined") {
				const isEmbedded = window.self !== window.top || window.location.search.includes("embed=true");
				if (isEmbedded) {
					return [new IframeWalletAdapter()];
				}
			}

			const rawClusterStr = (process.env.NEXT_PUBLIC_RPC_CLUSTER || "devnet").replace(/['"]+/g, "").trim().toLowerCase();
			const network = rawClusterStr.includes("mainnet")
				? WalletAdapterNetwork.Mainnet
				: rawClusterStr.includes("testnet")
					? WalletAdapterNetwork.Testnet
					: WalletAdapterNetwork.Devnet;

			return [
				new PhantomWalletAdapter({ network }),
				new SolflareWalletAdapter({ network }),
				new CoinbaseWalletAdapter(),
				new LedgerWalletAdapter(),
			];
		},
		[]
	);

	const endpoint = useMemo(() => {
		if (customRpcUrl) {
			const url = customRpcUrl.replace(/['"]+/g, "").trim();

			// The Solana Connection class requires a full URL (http/https).
			// If the env var is a relative path (like /api/rpc), we need to
			// resolve it to a full URL.
			if (url.startsWith("/")) {
				if (typeof window !== "undefined") {
					// Client-side: prepend the current origin
					return `${window.location.origin}${url}`;
				}
				// Server-side (SSR): use the real RPC URL directly
				return process.env.SOLANA_RPC_URL || clusterApiUrl(cluster as "devnet" | "mainnet-beta" | "testnet");
			}

			return url;
		}
		if (cluster === "localnet") return "http://127.0.0.1:8899";
		return clusterApiUrl(cluster as "devnet" | "mainnet-beta" | "testnet");
	}, [cluster, customRpcUrl]);

	const wsEndpoint = useMemo(() => {
		const raw = process.env.NEXT_PUBLIC_SOLANA_WSS_URL;
		if (raw) return raw.replace(/['"]+/g, "").trim();
		// Derive WSS from the resolved HTTP endpoint as a fallback
		return endpoint.replace(/^http/, "ws");
	}, [endpoint]);

	return (
		<ConnectionProvider endpoint={endpoint} config={{ wsEndpoint }}>
			<WalletProvider wallets={wallets} autoConnect>{children}</WalletProvider>
		</ConnectionProvider>
	);
}
