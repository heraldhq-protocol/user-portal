"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";

interface StepSuccessProps {
	txSignature: string;
	isAlreadyRegistered?: boolean;
	onConnectWallet: () => void;
}

export function StepSuccess({
	txSignature,
	isAlreadyRegistered,
	onConnectWallet,
}: StepSuccessProps) {
	const alreadyRegistered = isAlreadyRegistered || txSignature === "already-registered";

	const rpcCluster = process.env.NEXT_PUBLIC_RPC_CLUSTER?.replace(/['"]+/g, "").trim() || "devnet";
	const cluster = rpcCluster === "localnet" ? "custom&customUrl=http://127.0.0.1:8899" : rpcCluster;
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
							href={`https://solscan.io/tx/${txSignature}${rpcCluster !== "mainnet-beta" ? `?cluster=${cluster}` : ""}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-teal font-semibold hover:text-teal-2 transition-colors"
						>
							View on Solscan ↗
						</a>
					</div>
				</div>
			)}

			{/* Share buttons — only shown for fresh registrations or always? 
			    User asked specifically for options for history and preference. 
				I'll hide share buttons for returning users to reduce clutter as requested. */}
			{!alreadyRegistered && (
				<div className="flex gap-3 mb-6">
					<a
						href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just registered for privacy-preserving DeFi notifications with @herald_xyz 🔒⛓️\n\nMy email is encrypted — no protocol ever sees it.\n\nnotify.useherald.xyz")}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-card text-slate-700 font-semibold text-sm px-5 py-3 rounded-[10px] border border-slate-300 dark:border-border-2 hover:border-teal/50 hover:text-slate-900 dark:text-text-primary transition-all duration-150"
					>
						Share on 𝕏
					</a>
					<button
						onClick={() => navigator.clipboard.writeText("https://notify.useherald.xyz")}
						className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-card text-slate-700 font-semibold text-sm px-5 py-3 rounded-[10px] border border-slate-300 dark:border-border-2 hover:border-teal/50 hover:text-slate-900 dark:text-text-primary transition-all duration-150"
					>
						Copy link
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
					{alreadyRegistered && (
						<Link href="/preferences" className="w-full">
							<button className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-text-muted dark:hover:text-text-secondary transition-colors underline underline-offset-4 decoration-slate-300 hover:decoration-teal/50">
								Update notification preferences
							</button>
						</Link>
					)}
				</div>
			) : (
				<div className="flex flex-col gap-3">
					<Button
						onClick={onConnectWallet}
						className="w-full justify-center h-[52px] text-base font-bold shadow-lg shadow-teal/10"
					>
						Log into Herald Portal
					</Button>
				</div>
			)}
		</div>
	);
}
