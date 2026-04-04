"use client";

import { motion } from "motion/react";
import { useWallet, WalletNotSelectedError } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import type { WalletName } from "@solana/wallet-adapter-base";
import {
	WalletConnectionError,
	WalletNotConnectedError,
	WalletPublicKeyError,
	WalletTimeoutError,
} from "@solana/wallet-adapter-base";
import { useCallback, useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface StepConnectWalletProps {
	onConnected: (address: string | undefined) => void;
	onNext?: () => void;
	showNextButton?: boolean;
}

export function StepConnectWallet({
	onConnected,
	onNext,
	showNextButton = true,
}: StepConnectWalletProps) {
	const [selectedWalletName, setSelectedWalletName] = useState<string | null>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const connectionAttemptRef = useRef<string | null>(null);
	const shouldConnectRef = useRef<boolean>(false);

	const {
		select,
		connect,
		connected,
		disconnect,
		publicKey,
		wallet,
		wallets,
		connecting: walletConnecting,
	} = useWallet();

	// Get currently connected wallet info
	const connectedWallet = wallet?.adapter;

	// Sync local state with wallet adapter state when connection changes
	useEffect(() => {
		if (connected && publicKey && connectedWallet?.name) {
			setSelectedWalletName(connectedWallet.name);

			// Notify parent of connection
			onConnected(publicKey.toString());
			setIsConnecting(false);
			connectionAttemptRef.current = null;
		} else if (!connected && !walletConnecting && !isConnecting) {
			// Reset when disconnected and not in the middle of connecting
			if (selectedWalletName) {
				setSelectedWalletName(null);
				onConnected(undefined);
			}
			connectionAttemptRef.current = null;
		}
	}, [
		connected,
		publicKey,
		connectedWallet,
		selectedWalletName,
		onConnected,
		walletConnecting,
		isConnecting,
	]);

	// Handle automated connection after selection
	useEffect(() => {
		if (
			shouldConnectRef.current &&
			wallet &&
			!connected &&
			!walletConnecting &&
			wallet.adapter.name === connectionAttemptRef.current
		) {
			shouldConnectRef.current = false;
			console.log(`Triggering connect for ${wallet.adapter.name}`);
			connect().catch((err) => {
				console.error("Auto-connect error:", err);
				setIsConnecting(false);
				connectionAttemptRef.current = null;
			});
		}
	}, [wallet, connected, walletConnecting, connect]);

	const handleConnect = useCallback(
		async (walletName: WalletName) => {
			const targetWallet = wallets.find((w) => w.adapter.name === walletName);

			if (!targetWallet) {
				toast.error("Wallet not found");
				return;
			}

			// Prevent multiple connection attempts to the same wallet
			if (connectionAttemptRef.current === walletName && isConnecting) {
				console.log("Connection already in progress");
				return;
			}

			// If trying to connect to the same wallet that's already connected, do nothing
			if (connected && connectedWallet?.name === walletName) {
				toast.info(`${walletName} is already connected`);
				return;
			}

			setIsConnecting(true);
			connectionAttemptRef.current = walletName;

			try {
				// If already connected to a different wallet, disconnect first
				if (connected) {
					console.log("Disconnecting from current wallet...");
					await disconnect();
					// Small delay to ensure disconnect is complete
					await new Promise((resolve) => setTimeout(resolve, 300));
				}

				// Select the wallet
				console.log(`Selecting wallet: ${walletName}`);
				shouldConnectRef.current = true;
				select(walletName);

				// The connection will be picked up by the useEffect above
				// which monitors the 'wallet' state change.
			} catch (error: unknown) {
				console.error("Connection error:", error);
				setSelectedWalletName(null);
				connectionAttemptRef.current = null;

				if (error instanceof Error) {
					// Check specific error types from wallet adapter
					if (error instanceof WalletNotSelectedError) {
						toast.error(`Please ensure ${walletName} extension is installed and try again`);
					} else if (error instanceof WalletConnectionError) {
						if (error.message?.includes("rejected") || error.message?.includes("denied")) {
							toast.error(`Connection rejected by ${walletName}`);
						} else {
							toast.error(
								`Failed to connect to ${walletName}. Please check if the wallet is unlocked.`
							);
						}
					} else if (error instanceof WalletTimeoutError) {
						toast.error(`Connection timeout. Please try again.`);
					} else if (error instanceof WalletNotConnectedError) {
						toast.error(`Please connect your ${walletName} wallet first.`);
					} else if (error instanceof WalletPublicKeyError) {
						toast.error(`Unable to retrieve public key from ${walletName}.`);
					} else {
						// Generic error handling
						toast.error(`Failed to connect ${walletName}: ${error.message || "Unknown error"}`);
					}
				} else {
					// Handle non-Error objects
					toast.error(`Failed to connect ${walletName}. Please try again.`);
				}

				setIsConnecting(false);
			}
		},
		[select, disconnect, connected, connectedWallet, wallets, isConnecting]
	);

	const handleDisconnect = useCallback(async () => {
		try {
			setIsConnecting(true);
			await disconnect();
			setSelectedWalletName(null);
			connectionAttemptRef.current = null;
			toast.info("Wallet disconnected");
		} catch (error) {
			console.error("Disconnect error:", error);
			toast.error("Failed to disconnect");
		} finally {
			setIsConnecting(false);
		}
	}, [disconnect]);

	const isConnected = connected && !!publicKey;

	const handleNext = () => {
		if (isConnected && onNext) {
			onNext();
		} else {
			toast.error("Please connect a wallet first");
		}
	};

	return (
		<div>
			<h2 className="text-[26px] font-extrabold tracking-tight">
				{isConnected ? "Wallet Connected" : "Connect your wallet"}
			</h2>
			<p className="text-slate-500 dark:text-text-muted text-sm mb-7 leading-relaxed">
				{isConnected
					? `Connected to ${connectedWallet?.name || "wallet"}: ${publicKey?.toString().slice(0, 6)}...${publicKey?.toString().slice(-4)}`
					: "Your wallet is your identity. No username or password needed."}
			</p>

			{/* Display connected wallet info with disconnect option */}
			{isConnected && connectedWallet && (
				<div className="mb-5 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<Image
								src={connectedWallet.icon}
								alt={connectedWallet.name}
								width={32}
								height={32}
								className="rounded-lg"
							/>
							<div>
								<p className="font-semibold text-sm">{connectedWallet.name}</p>
								<p className="text-xs text-slate-500 dark:text-text-muted font-mono">
									{publicKey?.toString().slice(0, 8)}...
									{publicKey?.toString().slice(-8)}
								</p>
							</div>
						</div>
						<button
							onClick={handleDisconnect}
							disabled={isConnecting}
							className="px-3 py-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isConnecting ? "Disconnecting..." : "Disconnect"}
						</button>
					</div>
				</div>
			)}

			{/* Wallet grid - always visible */}
			<div className="grid grid-cols-2 gap-3 mb-5">
				{Array.from(new Map(wallets.map((w) => [w.adapter.name, w])).values()).map((w) => {
					const adapter = w.adapter;
					const isCurrentWallet = isConnected && connectedWallet?.name === adapter.name;
					const isDisabled = isConnecting || (isConnected && isCurrentWallet);

					return (
						<motion.button
							key={adapter.name}
							whileHover={{ scale: isDisabled ? 1 : 1.02 }}
							whileTap={{ scale: isDisabled ? 1 : 0.98 }}
							onClick={() => !isDisabled && handleConnect(adapter.name)}
							disabled={isDisabled}
							className={cn(
								"flex items-center gap-2.5 border rounded-xl p-4 cursor-pointer transition-all duration-150",
								isCurrentWallet
									? "bg-emerald-500/20 border-emerald-500/50 cursor-default"
									: "bg-white dark:bg-card border-slate-200 dark:border-border hover:border-slate-300 hover:bg-white/90 dark:hover:bg-card/80",
								isConnecting && "opacity-50 cursor-not-allowed"
							)}
						>
							<Image
								src={adapter.icon}
								alt={adapter.name}
								width={32}
								height={32}
								className="rounded-lg"
								onError={(e) => {
									// Fallback to colored circle with initial
									const target = e.currentTarget;
									target.style.display = "none";
									target.parentElement?.querySelector(".fallback-icon")?.classList.remove("hidden");
								}}
							/>
							<div className="fallback-icon hidden w-8 h-8 rounded-lg md:flex items-center justify-center text-sm font-extrabold text-white bg-gray-500">
								{adapter.name[0]}
							</div>
							<div className="flex flex-col items-start">
								<span className="font-semibold text-sm text-slate-700 dark:text-text-secondary">
									{adapter.name}
								</span>
								{isCurrentWallet && <span className="text-xs text-emerald-500">Connected</span>}
							</div>
						</motion.button>
					);
				})}
			</div>

			{/* Helper text */}
			<div className="mb-4 text-xs text-slate-500 dark:text-text-muted text-center">
				{isConnected
					? "Click on a different wallet to switch, or click Disconnect above"
					: "Select a wallet to connect"}
			</div>

			{/* Loading state */}
			{isConnecting && (
				<div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
					<div className="flex items-center gap-3 justify-center">
						<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
						<p className="text-sm text-blue-500">
							{selectedWalletName ? `Connecting to ${selectedWalletName}...` : "Processing..."}
						</p>
					</div>
				</div>
			)}

			{/* Next Button */}
			{showNextButton && isConnected && !isConnecting && (
				<motion.button
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					onClick={handleNext}
					className="w-full mt-6 py-3 bg-teal hover:bg-teal/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
				>
					Continue to Email →
				</motion.button>
			)}

			{/* Trust message */}
			<div className="px-4 py-3 bg-teal/5 rounded-[10px] border border-teal/12 mt-6">
				<p className="text-xs text-teal leading-relaxed">
					Herald only uses your wallet for identity. We never request transaction fees at this step.
				</p>
			</div>
		</div>
	);
}
