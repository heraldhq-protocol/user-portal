"use client";

import { cn } from "@/lib/utils";

interface Step {
	key: string;
	label: string;
}

interface StepIndicatorProps {
	steps: Step[];
	currentIndex: number;
}

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
	return (
		<div className="flex items-center gap-0">
			{steps.map((s, i) => (
				<div key={s.key} className="flex items-center">
					<div className="flex flex-col items-center gap-1">
						{/* Dot */}
						<div
							className={cn(
								"w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-all duration-200",
								i < currentIndex && "bg-teal text-navy",
								i === currentIndex && "bg-transparent border-2 border-teal text-teal",
								i > currentIndex &&
									"bg-transparent border-2 border-slate-300 dark:border-border-2 text-slate-500 dark:text-text-muted"
							)}
						>
							{i < currentIndex ? "✓" : i + 1}
						</div>
						{/* Label */}
						<span
							className={cn(
								"text-[10px] font-semibold",
								i === currentIndex ? "text-teal" : "text-slate-500 dark:text-text-muted"
							)}
						>
							{s.label}
						</span>
					</div>
					{/* Connector line */}
					{i < steps.length - 1 && (
						<div
							className={cn(
								"w-7 h-px mx-1 mb-[18px] transition-colors duration-200",
								i < currentIndex ? "bg-teal" : "bg-border-2"
							)}
						/>
					)}
				</div>
			))}
		</div>
	);
}
