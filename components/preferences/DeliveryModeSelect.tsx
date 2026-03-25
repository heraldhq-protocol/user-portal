import { cn } from "@/lib/utils";

interface DeliveryModeSelectProps {
	value: boolean; // true = digestMode, false = realtime
	onChange: (digestMode: boolean) => void;
}

const MODES = [
	{ id: "realtime", digestMode: false, label: "Real-time", desc: "Delivered immediately" },
	{ id: "digest", digestMode: true, label: "Daily digest", desc: "Batched every day at 9am UTC" },
];

export function DeliveryModeSelect({ value, onChange }: DeliveryModeSelectProps) {
	return (
		<div className="flex flex-col gap-2">
			{MODES.map((mode) => {
				const isActive = mode.digestMode === value;
				return (
					<div
						key={mode.id}
						onClick={() => onChange(mode.digestMode)}
						className={cn(
							"flex items-center gap-3.5 px-3.5 py-3 rounded-[10px] cursor-pointer transition-all duration-150 border",
							isActive
								? "bg-teal/5 border-teal/20"
								: "bg-transparent border-slate-200 dark:border-border hover:border-slate-300 dark:border-border-2"
						)}
						role="radio"
						aria-checked={isActive}
					>
						<div
							className={cn(
								"w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center",
								isActive ? "border-teal" : "border-slate-300 dark:border-border-2"
							)}
						>
							{isActive && <div className="w-2 h-2 rounded-full bg-teal" />}
						</div>
						<div>
							<div className="text-sm font-semibold text-slate-700 dark:text-text-secondary">
								{mode.label}
							</div>
							<div className="text-xs text-slate-500 dark:text-text-muted">{mode.desc}</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
