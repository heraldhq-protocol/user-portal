"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { UserClient, SolanaCluster } from "@herald-protocol/sdk";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { fetchApiWithSignature } from "@/lib/api";
import { safeStorage } from "@/lib/storage";
import Image from "next/image";

interface StepLoginProps {
	onBack: () => void;
	onComplete: () => void;
}

export function StepLogin({ onBack, onComplete }: StepLoginProps) {
	const { publicKey, wallet, signTransaction, signMessage } = useWallet();
	const { connection } = useConnection();
	const { login, isLoggingIn } = useAuth();
	const [loginFailed, setLoginFailed] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const connectedWallet = wallet?.adapter;

	const handleLogin = async () => {
		setLoginFailed(false);
		setDeleteError(null);
		try {
			await login();
			onComplete();
		} catch {
			setLoginFailed(true);
		}
	};

	const handleDeleteAndReset = async () => {
		if (!publicKey || !signTransaction || !signMessage) return;

		setIsDeleting(true);
		setDeleteError(null);
		try {
			const owner = publicKey;

			// 1. Build and broadcast on-chain deleteIdentity
			const userClient = new UserClient({
				cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as SolanaCluster) || "devnet",
				rpcUrl: connection.rpcEndpoint,
			});
			const ix = await userClient.deleteIdentity({ owner });

			const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
			const tx = new Transaction({
				feePayer: owner,
				blockhash,
				lastValidBlockHeight,
			}).add(ix);

			const signedTx = await signTransaction(tx);
			const signature = await connection.sendRawTransaction(signedTx.serialize(), {
				skipPreflight: false,
				preflightCommitment: "confirmed",
			});
			await connection.confirmTransaction(
				{ signature, blockhash, lastValidBlockHeight },
				"confirmed",
			);

			// 2. Wipe off-chain DB data (wallet-signed auth, no JWT)
			await fetchApiWithSignature(
				"/portal/account/delete-with-signature",
				publicKey.toBase58(),
				signMessage,
			);

			// 3. Clear local state and full refresh to restart the wizard
			safeStorage.removeItem("herald_portal_token");
			window.location.reload();
		} catch (err: unknown) {
			console.error("Delete account error:", err);
			setDeleteError(
				err instanceof Error ? err.message : "Failed to delete account",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex flex-col gap-1">
			<h2 className="text-[26px] font-extrabold tracking-tight">Welcome Back</h2>
			<p className="text-text-muted text-sm mb-7 leading-relaxed">
				Your wallet is already registered. Sign a message to access your Herald preferences.
			</p>

			{/* Connected Wallet Info */}
			{publicKey && connectedWallet && (
				<div className="mb-8 p-4 sm:p-5 bg-card-2 border border-border-2 rounded-xl">
					<div className="flex items-center gap-3">
						<div className="relative w-10 h-10 shrink-0">
							<Image
								src={connectedWallet.icon}
								alt={connectedWallet.name}
								fill
								className="rounded-lg object-contain"
							/>
						</div>
						<div className="flex-1 min-w-0">
							<p className="font-bold text-text-secondary leading-tight truncate">
								{connectedWallet.name}
							</p>
							<p className="text-[13px] font-mono text-text-muted mt-0.5 truncate">
								<span className="hidden sm:inline">
									{publicKey.toBase58().slice(0, 10)}...{publicKey.toBase58().slice(-10)}
								</span>
								<span className="inline sm:hidden">
									{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
								</span>
							</p>
						</div>
						<div className="flex flex-col items-end gap-1 shrink-0">
							<div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
							<span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
								Registered
							</span>
						</div>
					</div>
				</div>
			)}

			{loginFailed && (
				<div className="mb-6 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
					<p className="text-red-400/80 text-xs leading-relaxed">
						Can&apos;t sign in?{" "}
						{isDeleting ? (
							<span className="text-red-400/60">Deleting account...</span>
						) : (
							<button
								onClick={handleDeleteAndReset}
								className="font-bold text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
							>
								Delete and start fresh
							</button>
						)}
					</p>
					{deleteError && (
						<p className="text-red-400/60 text-xs mt-1">{deleteError}</p>
					)}
				</div>
			)}

			<div className="flex flex-col gap-3">
				<Button
					onClick={handleLogin}
					disabled={isLoggingIn || isDeleting}
					size="lg"
					data-adtivity-button-track="Sign in to Herald"
					className="w-full justify-center h-[52px] text-base font-bold shadow-lg shadow-teal/10"
				>
					{isLoggingIn ? (
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
							<span>Signing Message...</span>
						</div>
					) : (
						"Sign in to Herald →"
					)}
				</Button>

				<button
					onClick={onBack}
					disabled={isLoggingIn || isDeleting}
					className="w-full py-3 text-sm font-semibold text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50"
				>
					← Use a different wallet
				</button>
			</div>

			<div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3 items-start">
				<div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
					<span className="text-[10px] font-bold text-blue-500">i</span>
				</div>
				<p className="text-xs text-blue-500/80 leading-relaxed font-medium">
					Signing a message is free and secure. It simply proves you own this wallet so we can
					safely load your encrypted inbox.
				</p>
			</div>
		</div>
	);
}
