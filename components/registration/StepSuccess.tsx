"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";

interface StepSuccessProps {
	txSignature: string;
	isAlreadyRegistered?: boolean;
	onConnectWallet: () => void;
}

const REDIRECT_SECONDS = 30;

export function StepSuccess({
	txSignature,
	isAlreadyRegistered,
	onConnectWallet,
}: StepSuccessProps) {
	const alreadyRegistered = isAlreadyRegistered || txSignature === "already-registered";
	const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
	const [copied, setCopied] = useState(false);

	const rpcCluster = process.env.NEXT_PUBLIC_RPC_CLUSTER?.replace(/['"]+/g, "").trim() || "devnet";
	const cluster = rpcCluster === "localnet" ? "custom&customUrl=http://127.0.0.1:8899" : rpcCluster;
	const solscanUrl = `https://solscan.io/tx/${txSignature}${rpcCluster !== "mainnet-beta" ? `?cluster=${cluster}` : ""}`;
	const tweetText = encodeURIComponent(
		"Just registered for privacy-preserving DeFi notifications with @herald_xyz 🔒⛓️\n\nMy email is encrypted — no protocol ever sees it.\n\nnotify.useherald.xyz"
	);

	const handleRedirect = useCallback(() => {
		if (alreadyRegistered) {
			// For returning users, go directly to notifications
			window.location.href = "/notifications";
		} else {
			// For fresh registrations, reload to enter the portal
			window.location.reload();
		}
	}, [alreadyRegistered]);

	// Countdown timer
	useEffect(() => {
		if (countdown <= 0) {
			handleRedirect();
			return;
		}
		const timer = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [countdown, handleRedirect]);

	const handleCopyLink = () => {
		navigator.clipboard.writeText("https://notify.useherald.xyz");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// Circular progress for countdown
	const radius = 18;
	const circumference = 2 * Math.PI * radius;
	const progress = ((REDIRECT_SECONDS - countdown) / REDIRECT_SECONDS) * circumference;

	return (
		<div className="text-center">
			{/* Checkmark */}
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
				className="w-[72px] h-[72px] bg-teal/12 border-2 border-teal rounded-full flex items-center justify-center text-[28px] mx-auto mb-6"
			>
				✓
			</motion.div>

			<h2 className="text-[28px] font-extrabold tracking-tight mb-2.5">
				{alreadyRegistered ? "Welcome back!" : "You're registered!"}
			</h2>
			<p className="text-slate-500 dark:text-text-muted text-sm leading-relaxed mb-7 max-w-[360px] mx-auto">
				{alreadyRegistered
					? "You've successfully signed back in. Manage your alerts or view your notification history below."
					: "You'll now receive DeFi alerts from Herald-integrated protocols directly to your inbox\u00a0— without sharing your email with any of them."}
			</p>

			{/* Transaction card — only shown for fresh registrations */}
			{!alreadyRegistered && (
				<div className="bg-slate-50 dark:bg-card-2 border border-slate-300 dark:border-border-2 rounded-xl p-5 text-left mb-6">
					<div className="text-[11px] text-slate-500 dark:text-text-muted font-semibold mb-1.5">
						Transaction:
					</div>
					<div className="flex flex-col flex-1 items-center justify-between gap-4">
						<div className="font-mono text-[13px] text-slate-700 dark:text-text-secondary truncate w-full">
							{txSignature}
						</div>
						<a
							href={solscanUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-teal font-semibold hover:text-teal-2 transition-colors"
						>
							View on Solscan ↗
						</a>
					</div>
				</div>
			)}

			{/* Share & Solscan action buttons — only shown for fresh registrations */}
			{!alreadyRegistered && (
				<div className="flex gap-3 mb-6">
					<a
						href={`https://twitter.com/intent/tweet?text=${tweetText}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-card text-slate-700 font-semibold text-sm px-5 py-3 rounded-[10px] border border-slate-300 dark:border-border-2 hover:border-teal/50 hover:text-slate-900 dark:text-text-primary transition-all duration-150"
					>
						Share on 𝕏
					</a>
					<button
						onClick={handleCopyLink}
						className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-card text-slate-700 font-semibold text-sm px-5 py-3 rounded-[10px] border border-slate-300 dark:border-border-2 hover:border-teal/50 hover:text-slate-900 dark:text-text-primary transition-all duration-150"
					>
						{copied ? "Copied ✓" : "Copy link"}
					</button>
				</div>
			)}

			{/* CTAs */}
			{alreadyRegistered ? (
				<div className="flex flex-col gap-3">
					<Link href="/notifications" className="w-full">
						<Button className="w-full justify-center h-[52px] text-base font-bold shadow-lg shadow-teal/10">
							View notification history →
						</Button>
					</Link>
					<Link href="/preferences" className="w-full">
						<button className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-text-muted dark:hover:text-text-secondary transition-colors underline underline-offset-4 decoration-slate-300 hover:decoration-teal/50">
							Update notification preferences
						</button>
					</Link>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					<Button
						onClick={handleRedirect}
						className="w-full justify-center h-[52px] text-base font-bold shadow-lg shadow-teal/10"
					>
						Log into Herald Portal
					</Button>
				</div>
			)}

			{/* Countdown bar */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				className="mt-8 flex flex-col items-center gap-3"
			>
				<div className="relative w-11 h-11 flex items-center justify-center">
					{/* Background circle */}
					<svg className="absolute inset-0 -rotate-90" width="44" height="44" viewBox="0 0 44 44">
						<circle
							cx="22"
							cy="22"
							r={radius}
							fill="none"
							stroke="currentColor"
							className="text-slate-200 dark:text-border-2"
							strokeWidth="2.5"
						/>
						<circle
							cx="22"
							cy="22"
							r={radius}
							fill="none"
							stroke="currentColor"
							className="text-teal"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeDasharray={circumference}
							strokeDashoffset={circumference - progress}
							style={{ transition: "stroke-dashoffset 1s linear" }}
						/>
					</svg>
					<span className="text-xs font-bold text-slate-600 dark:text-text-secondary tabular-nums">
						{countdown}
					</span>
				</div>
				<p className="text-xs text-slate-400 dark:text-text-muted">
					Redirecting in <span className="font-semibold text-slate-500 dark:text-text-secondary tabular-nums">{countdown}s</span>
					{" · "}
					<button
						onClick={handleRedirect}
						className="text-teal hover:text-teal-2 font-semibold transition-colors"
					>
						go now
					</button>
				</p>
			</motion.div>
		</div>
	);
}
