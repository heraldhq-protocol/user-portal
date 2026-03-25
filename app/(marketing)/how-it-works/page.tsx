"use client";

import Link from "next/link";
import { motion } from "motion/react";

const steps = [
	{
		n: "01",
		title: "User registers",
		color: "var(--color-teal)",
		desc: "A wallet holder visits notify.herald.xyz, connects their wallet, and enters their email address. The email is encrypted in the browser using TweetNaCl.js — plaintext never leaves the device.",
	},
	{
		n: "02",
		title: "On-chain storage",
		color: "var(--color-herald-purple)",
		desc: "A Solana transaction calls register_identity() on the Herald Anchor program. The IdentityAccount PDA stores the encrypted email blob, nonce, SHA-256 hash, and opt-in flags.",
	},
	{
		n: "03",
		title: "Protocol sends alert",
		color: "var(--color-herald-gold)",
		desc: "A DeFi protocol calls POST /v1/notify with a wallet address and message. Herald looks up the IdentityAccount on-chain, decrypts the email inside a Nitro Enclave (TEE), and dispatches via AWS SES.",
	},
	{
		n: "04",
		title: "ZK receipt written",
		color: "var(--color-teal)",
		desc: "After confirmed delivery, Herald writes a ZK-compressed receipt leaf to Solana via Light Protocol. Cost: ~$0.0001. The protocol never learns the user's email at any point.",
	},
];

export default function HowItWorksPage() {
	return (
		<div className="max-w-[700px] mx-auto px-6 py-16">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl font-extrabold tracking-tight mb-3">How Herald works</h1>
					<p className="text-base text-slate-500 dark:text-text-muted leading-[1.7] max-w-[540px]">
						A privacy-preserving notification layer for Solana DeFi — from wallet to inbox, with
						zero PII exposure.
					</p>
				</div>

				{/* Steps */}
				{steps.map((s, i) => (
					<motion.div
						key={i}
						initial={{ opacity: 0, x: -16 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: i * 0.1, duration: 0.4 }}
						className="flex gap-6 mb-10"
					>
						<div className="flex flex-col items-center">
							<div
								className="w-11 h-11 rounded-xl flex items-center justify-center font-mono text-[13px] font-semibold shrink-0"
								style={{
									background: `${s.color}18`,
									border: `1px solid ${s.color}40`,
									color: s.color,
								}}
							>
								{s.n}
							</div>
							{i < steps.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
						</div>
						<div className={i < steps.length - 1 ? "pb-6" : ""}>
							<h3 className="text-lg font-bold mb-2" style={{ color: s.color }}>
								{s.title}
							</h3>
							<p className="text-sm text-slate-500 dark:text-text-muted leading-[1.7]">{s.desc}</p>
						</div>
					</motion.div>
				))}

				{/* CTA */}
				<Link
					href="/register"
					className="inline-flex items-center gap-2 bg-teal text-navy font-bold text-[15px] px-7 py-3 rounded-[10px] hover:bg-teal-2 active:scale-[0.97] transition-all duration-150"
				>
					Get started →
				</Link>
			</motion.div>
		</div>
	);
}
