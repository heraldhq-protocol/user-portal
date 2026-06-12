"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, relativeTime, truncateAddress } from "@/lib/utils";
import { type Notification, type NotificationStatus } from "@/types";
import { Lock, CheckCircle2, XCircle, Clock, Ban, AlertTriangle, Flag, Info } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { fetchApi } from "@/lib/api";

const statusConfig: Record<NotificationStatus, { dot: string; label: string; Icon: typeof CheckCircle2 }> = {
	delivered: {
		dot: "bg-[#00C896] shadow-[0_0_6px_rgba(0,200,150,0.5)]",
		label: "Delivered",
		Icon: CheckCircle2,
	},
	failed: {
		dot: "bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]",
		label: "Failed",
		Icon: XCircle,
	},
	partial: {
		dot: "bg-[#E8920A] shadow-[0_0_6px_rgba(232,146,10,0.5)]",
		label: "Partial",
		Icon: AlertTriangle,
	},
	processing: {
		dot: "bg-[#60A5FA] shadow-[0_0_6px_rgba(96,165,250,0.5)]",
		label: "Processing",
		Icon: Clock,
	},
	queued: {
		dot: "bg-[#94A3B8] shadow-[0_0_6px_rgba(148,163,184,0.5)]",
		label: "Queued",
		Icon: Clock,
	},
	opted_out: {
		dot: "bg-[#64748B] shadow-[0_0_6px_rgba(100,116,139,0.3)]",
		label: "Opted out",
		Icon: Ban,
	},
	digested: {
		dot: "bg-[#8B5CF6] shadow-[0_0_6px_rgba(139,92,246,0.4)]",
		label: "Digested",
		Icon: CheckCircle2,
	},
};

const REPORT_REASONS = [
	{ value: "spam", label: "Spam" },
	{ value: "phishing", label: "Phishing / Scam" },
	{ value: "impersonation", label: "Impersonation" },
	{ value: "unwanted", label: "Unwanted" },
	{ value: "other", label: "Other" },
] as const;

type ReportReason = (typeof REPORT_REASONS)[number]["value"];

type ProtocolMeta = { name: string | null; logoUrl: string | null; websiteUrl: string | null };

export function NotificationCard({
	notification,
	protocolMeta,
}: {
	notification: Notification;
	protocolMeta?: ProtocolMeta;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [reason, setReason] = useState<ReportReason | null>(null);
	const [details, setDetails] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [reported, setReported] = useState(false);

	const tx = notification.receiptTx || notification.id;
	const status = notification.status || "delivered";
	const config = statusConfig[status] || statusConfig.delivered;
	const StatusIcon = config.Icon;

	async function handleReport() {
		if (!reason) return;
		setSubmitting(true);
		try {
			const result = await fetchApi<{ success: boolean; already_reported: boolean }>(
				`/portal/notifications/${notification.id}/report`,
				{
					method: "POST",
					body: JSON.stringify({ reason, details: details.trim() || undefined }),
				},
			);
			if (result.success) {
				setReported(true);
				setTimeout(() => setDialogOpen(false), 1200);
			}
		} catch {
			// non-fatal — user can retry
		} finally {
			setSubmitting(false);
		}
	}

	function handleOpenChange(open: boolean) {
		setDialogOpen(open);
		if (!open && !reported) {
			setReason(null);
			setDetails("");
		}
	}

	return (
		<div className={cn(
			"group relative flex gap-3 sm:gap-4 items-start p-4 sm:p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] h-full overflow-hidden",
			status === "failed"
				? "border-herald-red/20 bg-herald-red/5 hover:border-herald-red/40 hover:bg-herald-red/10"
				: "border-border bg-card/40 hover:bg-card-2 hover:border-teal/30",
		)}>
			{/* Subtle shine effect on hover */}
			<div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none" />

			{/* Attribution info button */}
			<Popover>
				<PopoverTrigger asChild>
					<button
						onClick={(e) => e.stopPropagation()}
						className="absolute top-3 right-9 p-1 rounded opacity-40 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-text-muted hover:text-teal hover:bg-teal/10"
						title="Why did I get this?"
					>
						<Info className="size-3.5" />
					</button>
				</PopoverTrigger>
				<PopoverContent align="end" className="w-64 text-xs space-y-2.5">
					<p className="font-bold text-text-primary text-[11px] uppercase tracking-wide">
						Why did I get this?
					</p>
					<div className="space-y-1.5">
						<div className="flex justify-between gap-2">
							<span className="text-text-muted">Protocol</span>
							<span className="font-semibold text-text-secondary text-right truncate max-w-[140px]">
								{protocolMeta?.name ?? notification.protocolId}
							</span>
						</div>
						<div className="flex justify-between gap-2">
							<span className="text-text-muted">Category</span>
							<span className="font-semibold text-text-secondary capitalize">
								{notification.category}
							</span>
						</div>
						{notification.queuedAt && (
							<div className="flex justify-between gap-2">
								<span className="text-text-muted">Queued</span>
								<span className="font-semibold text-text-secondary">
									{new Date(notification.queuedAt).toLocaleString(undefined, {
										month: "short", day: "numeric",
										hour: "numeric", minute: "2-digit",
									})}
								</span>
							</div>
						)}
						{notification.deliveredAt && (
							<div className="flex justify-between gap-2">
								<span className="text-text-muted">Delivered</span>
								<span className="font-semibold text-text-secondary">
									{new Date(notification.deliveredAt).toLocaleString(undefined, {
										month: "short", day: "numeric",
										hour: "numeric", minute: "2-digit",
									})}
								</span>
							</div>
						)}
					</div>
					<p className="text-[10px] text-text-muted border-t border-border pt-2">
						You&apos;re subscribed to {protocolMeta?.name ?? notification.protocolId} on Herald.
					</p>
				</PopoverContent>
			</Popover>

			{/* Report abuse button — visible on hover (or permanently if reported) */}
			<button
				onClick={(e) => { e.stopPropagation(); setDialogOpen(true); }}
				className={cn(
					"absolute top-3 right-3 p-1 rounded transition-all",
					reported
						? "opacity-100 text-[#EF4444]"
						: "opacity-40 sm:opacity-0 sm:group-hover:opacity-100 text-text-muted hover:text-[#EF4444] hover:bg-herald-red/10",
				)}
				title={reported ? "Reported" : "Report abuse"}
			>
				<Flag className="size-3.5" fill={reported ? "currentColor" : "none"} />
			</button>

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
				{/* Badge + protocol + time + status */}
				<div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mb-2 pr-12 sm:pr-0">
					<Badge
						variant={notification.category}
						className="uppercase px-2.5 py-0.5 text-[10px] tracking-wider font-extrabold shrink-0"
					>
						{notification.category}
					</Badge>
					<span className="text-[13px] font-bold text-text-secondary inline-block truncate tracking-tight min-w-0 max-w-[100px] min-[375px]:max-w-[140px] sm:max-w-none">
						{notification.protocolId}
					</span>
					<div className="flex items-center gap-1.5 ml-auto shrink-0">
						<div className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
						<StatusIcon className={cn(
							"size-3",
							status === "delivered" || status === "digested" ? "text-[#00C896]" : "",
							status === "failed" ? "text-[#EF4444]" : "",
							status === "processing" || status === "queued" ? "text-[#60A5FA]" : "",
							status === "opted_out" ? "text-[#64748B]" : "",
							status === "partial" ? "text-[#E8920A]" : "",
						)} />
						<span className={cn(
							"text-[11px] font-semibold",
							status === "delivered" || status === "digested" ? "text-[#00C896]" : "",
							status === "failed" ? "text-[#EF4444]" : "",
							status === "processing" || status === "queued" ? "text-[#60A5FA]" : "",
							status === "opted_out" ? "text-[#64748B]" : "",
							status === "partial" ? "text-[#E8920A]" : "",
						)}>
							{config.label}
						</span>
						<span className="text-[11px] font-medium text-text-muted shrink-0">
							{relativeTime(notification.deliveredAt || notification.queuedAt)}
						</span>
					</div>
				</div>

				{/* Subject preview */}
				{notification.subject && (
					<div className="text-[15px] leading-snug font-semibold text-text-primary mb-1 line-clamp-2 break-words group-hover:text-teal-50 transition-colors">
						{notification.subject}
					</div>
				)}

				{/* Error info for failed notifications */}
				{status === "failed" && notification.errorCode && (
					<div className="mb-2">
						<div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-herald-red/10 border border-herald-red/20">
							<span className="text-[11px] text-[#EF4444] font-mono font-medium">
								{notification.errorCode}
							</span>
						</div>
					</div>
				)}

				{/* Encrypted / Message state */}
				<div className="mb-3">
					{notification.message ? (
						<div className="flex flex-col gap-1">
							<p className="text-[13px] text-text-muted leading-relaxed line-clamp-3 break-words">
								{notification.message}
							</p>
							{notification.actionUrl && (
								<a
									href={notification.actionUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[12px] text-teal hover:underline inline-flex items-center mt-1"
								>
									View Details ↗
								</a>
							)}
						</div>
					) : notification.ciphertext ? (
						<div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-card-2 border border-border-2">
							<Lock className="size-3 text-text-muted" />
							<span className="text-[11px] text-text-muted font-medium">End-to-End Encrypted</span>
						</div>
					) : null}
				</div>

				{/* Receipt link */}
				{notification.receiptTx && (
					<div className="flex items-center flex-wrap gap-2 mt-auto pt-2 border-t border-border/50">
						<span className="font-mono text-[11px] font-medium text-teal-dim bg-teal/5 px-2 py-0.5 rounded-md border border-teal/10">
							{truncateAddress(tx, 4)}
						</span>
						<a
							href={`https://solscan.io/tx/${notification.receiptTx}${process.env.NEXT_PUBLIC_RPC_CLUSTER !== "mainnet-beta" ? `?cluster=${process.env.NEXT_PUBLIC_RPC_CLUSTER || "devnet"}` : ""}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[11px] text-teal font-bold hover:text-teal-2 transition-colors inline-flex items-center gap-1"
						>
							Verify on-chain <span className="text-[14px]">↗</span>
						</a>
					</div>
				)}
			</div>

			{/* Report abuse dialog */}
			<Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
				<DialogContent onClick={(e) => e.stopPropagation()}>
					<DialogHeader>
						<DialogTitle>Report notification</DialogTitle>
						<DialogDescription>
							{reported
								? "Thank you — your report has been submitted."
								: "Help us keep Herald safe. Select a reason for reporting this notification."}
						</DialogDescription>
					</DialogHeader>

					{!reported && (
						<>
							<div className="flex flex-col gap-2">
								{REPORT_REASONS.map((r) => (
									<label
										key={r.value}
										className={cn(
											"flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm",
											reason === r.value
												? "border-[#EF4444]/50 bg-herald-red/10 text-text-primary"
												: "border-border bg-card/30 text-text-muted hover:border-border-2 hover:text-text-secondary",
										)}
									>
										<input
											type="radio"
											name="report-reason"
											value={r.value}
											checked={reason === r.value}
											onChange={() => setReason(r.value)}
											className="accent-[#EF4444]"
										/>
										{r.label}
									</label>
								))}
							</div>

							{reason === "other" && (
								<textarea
									placeholder="Optional details…"
									value={details}
									onChange={(e) => setDetails(e.target.value)}
									maxLength={500}
									rows={3}
									className="w-full resize-none rounded-lg border border-border bg-card/30 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-2"
								/>
							)}

							<DialogFooter>
								<Button
									variant="danger"
									size="sm"
									disabled={!reason || submitting}
									onClick={handleReport}
								>
									{submitting ? "Submitting…" : "Submit report"}
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
