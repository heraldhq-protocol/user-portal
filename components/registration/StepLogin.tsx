"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface StepLoginProps {
	onBack: () => void;
	onComplete: () => void;
}

export function StepLogin({ onBack, onComplete }: StepLoginProps) {
	const { publicKey, wallet } = useWallet();
	const { login, isLoggingIn } = useAuth();

	const connectedWallet = wallet?.adapter;

	const handleLogin = async () => {
		try {
			await login();
			onComplete();
		} catch {
			// Error handled in useAuth toast
		}
	};

	return (
		<div className="flex flex-col gap-1">
			<h2 className="text-[26px] font-extrabold tracking-tight">Welcome Back</h2>
			<p className="text-slate-500 dark:text-text-muted text-sm mb-7 leading-relaxed">
				Your wallet is already registered. Sign a message to access your Herald preferences.
			</p>

			{/* Connected Wallet Info */}
			{publicKey && connectedWallet && (
				<div className="mb-8 p-5 bg-slate-50 dark:bg-card-2 border border-slate-200 dark:border-border-2 rounded-xl">
					<div className="flex items-center gap-3">
						<div className="relative w-10 h-10">
							<Image
								src={connectedWallet.icon}
								alt={connectedWallet.name}
								fill
								className="rounded-lg object-contain"
							/>
						</div>
						<div className="flex-1">
							<p className="font-bold text-slate-700 dark:text-text-secondary leading-tight">
								{connectedWallet.name}
							</p>
							<p className="text-[13px] font-mono text-slate-500 dark:text-text-muted mt-0.5">
								{publicKey.toBase58().slice(0, 10)}...{publicKey.toBase58().slice(-10)}
							</p>
						</div>
						<div className="flex flex-col items-end gap-1">
							<div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
							<span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
								Registered
							</span>
						</div>
					</div>
				</div>
			)}

			<div className="flex flex-col gap-3">
				<Button
					onClick={handleLogin}
					disabled={isLoggingIn}
					size="lg"
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
					disabled={isLoggingIn}
					className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-text-muted dark:hover:text-text-secondary transition-colors disabled:opacity-50"
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
