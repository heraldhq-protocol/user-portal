"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";

interface Prefs {
	optInAll: boolean;
	optInDefi: boolean;
	optInGovernance: boolean;
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
	"Encrypting email & deriving notification keys",
	"Building Solana transaction",
	"Awaiting wallet signature",
	"Recording on-chain",
];

const CATEGORIES = [
	{ key: "optInAll" as const, label: "All notifications", desc: "Subscribe to every category" },
	{ key: "optInDefi" as const, label: "DeFi alerts", desc: "Liquidations, health factor" },
	{ key: "optInGovernance" as const, label: "Governance", desc: "DAO votes, proposals" },
	{ key: "optInMarketing" as const, label: "Marketing", desc: "Product updates" },
];

export function StepEncryptSign({
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

	const togglePref = (key: keyof Omit<Prefs, "digestMode">, checked: boolean) => {
		onPrefsChange({ ...prefs, [key]: checked });
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
					<Toggle
						key={key}
						label={label}
						description={desc}
						checked={prefs[key]}
						onCheckedChange={(checked) => togglePref(key, checked)}
					/>
				))}

				<Toggle
					label="Daily digest"
					description="Batch notifications at 9am UTC"
					checked={prefs.digestMode}
					onCheckedChange={(checked) => onPrefsChange({ ...prefs, digestMode: checked })}
				/>
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
