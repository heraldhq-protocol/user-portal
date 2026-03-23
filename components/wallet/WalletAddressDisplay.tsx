"use client";
import { useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa6";
import { cn, truncateAddress } from "@/lib/utils";

interface WalletAddressDisplayProps {
	address: string;
	className?: string;
	chars?: number;
}

export function WalletAddressDisplay({ address, className, chars = 4 }: WalletAddressDisplayProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(address);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			onClick={handleCopy}
			title="Copy address"
			className={cn(
				"group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-navy border border-border-2 hover:border-teal/50 hover:bg-card-2 transition-all duration-200",
				className
			)}
		>
			<span className="font-mono text-sm font-semibold text-text-primary tracking-wide">
				{truncateAddress(address, chars)}
			</span>
			{copied ? (
				<FaCheck className="w-3.5 h-3.5 text-teal" />
			) : (
				<FaCopy className="w-3.5 h-3.5 text-text-muted group-hover:text-teal/70 transition-colors" />
			)}
		</button>
	);
}
