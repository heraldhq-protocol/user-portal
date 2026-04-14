"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface ToggleProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label?: string;
	description?: string;
	disabled?: boolean;
	id?: string;
}

export function Toggle({
	checked,
	onCheckedChange,
	label,
	description,
	disabled = false,
	id,
}: ToggleProps) {
	const toggleId = id || label?.toLowerCase().replace(/\s+/g, "-");

	return (
		<div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-border last:border-b-0">
			{(label || description) && (
				<div className="flex-1 mr-4">
					{label && (
						<label
							htmlFor={toggleId}
							className="text-sm font-semibold text-slate-700 dark:text-text-secondary cursor-pointer"
						>
							{label}
						</label>
					)}
					{description && (
						<p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">{description}</p>
					)}
				</div>
			)}
			<SwitchPrimitive.Root
				id={toggleId}
				checked={checked}
				onCheckedChange={onCheckedChange}
				disabled={disabled}
				className={cn(
					"relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy",
					"disabled:opacity-50 disabled:cursor-not-allowed",
					checked ? "bg-primary" : "bg-border-2"
				)}
			>
				<SwitchPrimitive.Thumb
					className={cn(
						"block w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200",
						"translate-x-[3px]",
						checked && "translate-x-[23px]"
					)}
				/>
			</SwitchPrimitive.Root>
		</div>
	);
}
