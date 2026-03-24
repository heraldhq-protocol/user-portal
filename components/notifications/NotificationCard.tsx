import { Badge } from "@/components/ui/Badge";
import { cn, relativeTime, truncateAddress } from "@/lib/utils";
import { type Notification } from "@/types";

export function NotificationCard({ notification }: { notification: Notification }) {
	const tx = notification.receiptTx || notification.id;

	return (
		<div className="group relative flex gap-4 items-start p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-card-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:border-teal/30 h-full overflow-hidden">
			{/* Subtle shine effect on hover */}
			<div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none" />
			
			<div
				className={cn(
					"w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 transition-transform duration-300 group-hover:scale-125",
					notification.category === "defi"
						? "bg-[#00C896] shadow-[0_0_8px_rgba(0,200,150,0.4)]"
						: notification.category === "governance"
							? "bg-[#5B35D5] shadow-[0_0_8px_rgba(91,53,213,0.4)]"
							: notification.category === "system"
								? "bg-[#E8920A] shadow-[0_0_8px_rgba(232,146,10,0.4)]"
								: "bg-[#64748B] shadow-[0_0_8px_rgba(100,116,139,0.4)]"
				)}
			/>

			<div className="flex-1 min-w-0 flex flex-col h-full relative z-10">
				{/* Badge + protocol + time */}
				<div className="flex items-center gap-2.5 mb-2">
					<Badge
						variant={notification.category}
						className="uppercase px-2.5 py-0.5 text-[10px] tracking-wider font-extrabold"
					>
						{notification.category}
					</Badge>
					<span className="text-[13px] font-bold text-text-secondary truncate tracking-tight">
						{notification.protocolId}
					</span>
					<span className="text-[11px] font-medium text-text-muted ml-auto shrink-0">
						{relativeTime(notification.deliveredAt || notification.queuedAt)}
					</span>
				</div>

				{/* Subject preview */}
				<div className="text-[15px] leading-snug font-semibold text-white mb-3 line-clamp-2 break-words group-hover:text-teal-50 transition-colors">
					{notification.subject || "Alert received from protocol"}
				</div>

				{/* Receipt link */}
				<div className="flex items-center gap-2 mt-auto pt-2 border-t border-border/50">
					<span className="font-mono text-[11px] font-medium text-teal-dim bg-teal/5 px-2 py-0.5 rounded-md border border-teal/10">
						{truncateAddress(tx, 4)}
					</span>
					{notification.receiptTx ? (
						<a
							href={`https://solscan.io/tx/${notification.receiptTx}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[11px] text-teal font-bold hover:text-teal-2 transition-colors inline-flex items-center gap-1"
						>
							Verify on-chain <span className="text-[14px]">↗</span>
						</a>
					) : (
						<span className="text-[11px] text-text-muted font-medium italic">Processing receipt...</span>
					)}
				</div>
			</div>
		</div>
	);
}
