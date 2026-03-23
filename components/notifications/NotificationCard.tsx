import { Badge } from "@/components/ui/Badge";
import { cn, relativeTime, truncateAddress } from "@/lib/utils";
import { type Notification } from "@/types";

export function NotificationCard({ notification }: { notification: Notification }) {
	const tx = notification.receiptTx || notification.id;

	return (
		<div className="flex gap-3.5 items-start p-4 rounded-xl border border-border bg-card transition-colors hover:border-border-2 h-full">
			<div
				className={cn(
					"w-2 h-2 rounded-full mt-1.5 shrink-0",
					notification.category === "defi"
						? "bg-[#00C896]"
						: notification.category === "governance"
							? "bg-[#5B35D5]"
							: notification.category === "system"
								? "bg-[#E8920A]"
								: "bg-[#64748B]"
				)}
			/>

			<div className="flex-1 min-w-0">
				{/* Badge + protocol + time */}
				<div className="flex items-center gap-2 mb-1.5">
					<Badge
						variant={notification.category}
						className="uppercase px-2.5 py-0 text-[10px] tracking-wider"
					>
						{notification.category}
					</Badge>
					<span className="text-xs font-semibold text-text-secondary truncate">
						{notification.protocolId}
					</span>
					<span className="text-[11px] text-text-muted ml-auto shrink-0">
						{relativeTime(notification.deliveredAt || notification.queuedAt)}
					</span>
				</div>

				{/* Subject preview */}
				<div className="text-sm font-semibold text-text-primary mb-2 line-clamp-1 break-all">
					{notification.subject || "Alert received from protocol"}
				</div>

				{/* Receipt link */}
				<div className="flex items-center gap-1.5 mt-auto">
					<span className="font-mono text-[11px] text-teal-dim">{truncateAddress(tx, 4)}</span>
					{notification.receiptTx ? (
						<a
							href={`https://solscan.io/tx/${notification.receiptTx}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[11px] text-teal font-semibold hover:text-teal-2 transition-colors inline-block"
						>
							View on Solscan ↗
						</a>
					) : (
						<span className="text-[11px] text-text-muted">No receipt yet</span>
					)}
				</div>
			</div>
		</div>
	);
}
