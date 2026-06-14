"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletRegistrationStatus } from "@/hooks/useWalletRegistrationStatus";
import { cn } from "@/lib/utils";

interface WalletStatusBadgeProps {
	className?: string;
}

export function WalletStatusBadge({ className }: WalletStatusBadgeProps) {
	const { connected, connecting } = useWallet();
	const { data: status, isLoading } = useWalletRegistrationStatus();

	let color = "bg-text-muted";
	let label = "Not Connected";
	let glow = false;

	if (connecting || isLoading) {
		color = "bg-[#E8920A]"; // gold
		label = connecting ? "Connecting..." : "Checking status...";
	} else if (connected) {
		if (status?.registered) {
			color = "bg-[#00C896]"; // teal
			label = "Secured & Registered";
			glow = true;
		} else {
			color = "bg-[#D63031]"; // red
			label = "Unregistered";
		}
	}

	return (
		<div
			className={cn(
				"inline-flex items-center rounded-full transition-all duration-200",
				"sm:px-2.5 sm:py-1 sm:border sm:border-border sm:bg-card sm:gap-2",
				"px-0 py-0 border-transparent bg-transparent gap-0",
				!connected && "opacity-70",
				className
			)}
		>
			<div className="relative flex h-2 w-2 shrink-0">
				{glow && (
					<span
						className={cn(
							"animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
							color
						)}
					/>
				)}
				<span className={cn("relative inline-flex rounded-full h-2 w-2", color)} />
			</div>
			<span className="hidden sm:block text-xs font-bold text-text-primary tracking-wide">
				{label}
			</span>
		</div>
	);
}
