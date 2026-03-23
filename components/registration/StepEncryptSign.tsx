"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Prefs {
	optInDefi: boolean;
	optInGovernance: boolean;
	optInSystem: boolean;
	optInMarketing: boolean;
	digestMode: boolean;
}

interface StepEncryptSignProps {
	email: string;
	prefs: Prefs;
	onPrefsChange: (prefs: Prefs) => void;
	onBack: () => void;
	onComplete: () => void;
	encryptPhase: number;
	isRegistering: boolean;
}

const ENCRYPT_STEPS = [
	"Converting wallet key for encryption",
	"Encrypting your email (in browser)",
	"Building Solana transaction",
	"Awaiting wallet signature",
	"Recording on-chain",
];

const CATEGORIES = [
	{ key: "optInDefi" as const, label: "DeFi alerts", desc: "Liquidations, health factor" },
	{ key: "optInGovernance" as const, label: "Governance", desc: "DAO votes, proposals" },
	{ key: "optInSystem" as const, label: "System", desc: "Security, maintenance" },
	{ key: "optInMarketing" as const, label: "Marketing", desc: "Product updates" },
];

export function StepEncryptSign({
	email,
	prefs,
	onPrefsChange,
	onBack,
	onComplete,
	encryptPhase,
	isRegistering,
}: StepEncryptSignProps) {
	// const [encryptProgress, setEncryptProgress] = useState(0);
	// const [isSigning, setIsSigning] = useState(false);

	const handleSign = useCallback(() => {
		// setIsSigning(true);
		// let p = 0;
		// const interval = setInterval(() => {
		//   p++;
		//   setEncryptProgress(p);
		//   if (p >= ENCRYPT_STEPS.length) {
		//     clearInterval(interval);
		//     // Simulated tx signature
		//     setTimeout(() => {
		//       onComplete('5xR4mKp2nQwBvTsYjL8d...');
		//     }, 600);
		//   }
		// }, 700);
		onComplete();
	}, [onComplete]);

	const togglePref = (key: keyof Omit<Prefs, "digestMode">) => {
		onPrefsChange({ ...prefs, [key]: !prefs[key] });
	};

	return (
		<div>
			<h2 className="text-[26px] font-extrabold tracking-tight mb-2">Confirm & sign</h2>
			<p className="text-text-muted text-sm mb-6 leading-relaxed">
				Review your preferences, then sign the transaction.
			</p>

			{/* Notification preferences */}
			<div className="bg-card-2 border border-border-2 rounded-xl p-5 mb-6">
				<div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
					Notification preferences
				</div>
				{CATEGORIES.map(({ key, label, desc }) => (
					<div
						key={key}
						className="flex items-center justify-between py-4 border-b border-border last:border-b-0"
					>
						<div>
							<div className="text-[13px] font-semibold text-text-secondary mb-0.5">{label}</div>
							<div className="text-[11px] text-text-muted">{desc}</div>
						</div>
						<button
							onClick={() => togglePref(key)}
							className={cn(
								"relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer",
								prefs[key] ? "bg-teal" : "bg-border-2"
							)}
							role="switch"
							aria-checked={prefs[key]}
							aria-label={`Toggle ${label}`}
						>
							<span
								className={cn(
									"absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200",
									prefs[key] && "translate-x-5"
								)}
							/>
						</button>
					</div>
				))}

				{/* Digest mode */}
				<div className="flex items-center justify-between py-4">
					<div>
						<div className="text-[13px] font-semibold text-text-secondary mb-0.5">Daily digest</div>
						<div className="text-[11px] text-text-muted">Batch notifications at 9am UTC</div>
					</div>
					<button
						onClick={() => onPrefsChange({ ...prefs, digestMode: !prefs.digestMode })}
						className={cn(
							"relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer",
							prefs.digestMode ? "bg-teal" : "bg-border-2"
						)}
						role="switch"
						aria-checked={prefs.digestMode}
						aria-label="Toggle daily digest"
					>
						<span
							className={cn(
								"absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200",
								prefs.digestMode && "translate-x-5"
							)}
						/>
					</button>
				</div>
			</div>

			{/* Encryption progress */}
			<div className="bg-card-2 border border-border-2 rounded-xl p-5 mb-4">
				<div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
					Encryption progress
				</div>
				{ENCRYPT_STEPS.map((step, i) => {
					const state =
						encryptPhase > i ? "done" : encryptPhase === i && isRegistering ? "active" : "pending";
					return (
						<div
							key={i}
							className={cn(
								"flex items-center gap-3 py-2.5",
								i < ENCRYPT_STEPS.length - 1 && "border-b border-border"
							)}
						>
							{/* Status dot */}
							<div
								className={cn(
									"w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs shrink-0",
									state === "done" && "bg-teal/15 text-teal border border-teal/30",
									state === "active" && "bg-teal/8 border border-teal animate-spin",
									state === "pending" && "bg-border border border-border-2"
								)}
							>
								{state === "done" ? "✓" : state === "active" ? "◌" : ""}
							</div>
							<span
								className={cn(
									"text-[13px]",
									state === "pending" ? "text-text-muted" : "text-text-secondary"
								)}
							>
								{step}
							</span>
						</div>
					);
				})}
			</div>

			{/* Actions */}
			<div className="flex gap-3">
				<Button variant="secondary" onClick={onBack} disabled={isRegistering}>
					← Back
				</Button>
				<Button className="flex-1" onClick={handleSign} disabled={isRegistering}>
					{isRegistering ? "Signing..." : "Sign transaction →"}
				</Button>
			</div>
		</div>
	);
}
