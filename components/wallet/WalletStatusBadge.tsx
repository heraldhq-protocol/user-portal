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
				"inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border bg-card",
				!connected && "opacity-70",
				className
			)}
		>
			<div className="relative flex h-2 w-2">
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
			<span className="text-xs font-bold text-text-primary tracking-wide">{label}</span>
		</div>
	);
}
