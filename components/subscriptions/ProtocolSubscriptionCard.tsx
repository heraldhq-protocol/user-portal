"use client";

import { Globe, Mail, MessageCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { type ProtocolSubscription } from "@/types";
import { cn } from "@/lib/utils";

const CHANNEL_ICONS: Record<string, React.ElementType> = {
	email: Mail,
	telegram: MessageCircle,
	sms: Smartphone,
};

interface Props {
	subscription: ProtocolSubscription;
	onUnsubscribe: () => void;
	onResubscribe: () => void;
	isPending: boolean;
}

export function ProtocolSubscriptionCard({
	subscription,
	onUnsubscribe,
	onResubscribe,
	isPending,
}: Props) {
	const { protocol, status, channels, subscribedAt, categories } =
		Object.assign(subscription, {
			categories: subscription.protocol.categories,
		});
	const isActive = status === "active";
	const displayName =
		protocol.name ?? `Protocol ${subscription.protocolId.slice(0, 8)}…`;
	const date = new Date(subscribedAt).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return (
		<div
			className={cn(
				"flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
				isActive
					? "bg-bg-elevated border-border"
					: "bg-bg-surface border-border opacity-60"
			)}
		>
			{/* Logo / fallback */}
			<div className="shrink-0 w-10 h-10 rounded-xl bg-bg-surface border border-border flex items-center justify-center overflow-hidden">
				{protocol.logoUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={protocol.logoUrl} alt={displayName} className="w-full h-full object-cover" />
				) : (
					<span className="text-base font-bold text-text-muted">
						{displayName[0].toUpperCase()}
					</span>
				)}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 flex-wrap mb-1">
					<span className="font-semibold text-sm text-text-primary truncate">
						{displayName}
					</span>
					{!isActive && (
						<Badge variant="warning" className="text-[10px] px-1.5 py-0.5">
							Unsubscribed
						</Badge>
					)}
				</div>

				{/* Channels */}
				<div className="flex items-center gap-2 mb-2">
					{channels.map((ch) => {
						const Icon = CHANNEL_ICONS[ch] ?? Globe;
						return (
							<span
								key={ch}
								className="inline-flex items-center gap-1 text-[11px] text-text-muted"
							>
								<Icon size={11} />
								{ch}
							</span>
						);
					})}
				</div>

				{/* Categories */}
				{categories.length > 0 && (
					<div className="flex flex-wrap gap-1 mb-2">
						{categories.map((cat) => (
							<Badge key={cat} variant="info" className="text-[10px] px-1.5 py-0.5 capitalize">
								{cat}
							</Badge>
						))}
					</div>
				)}

				<div className="flex items-center justify-between gap-3 flex-wrap">
					<span className="text-[11px] text-text-muted">
						{isActive ? "Subscribed" : "Unsubscribed"} · {date}
					</span>
					{protocol.websiteUrl && (
						<a
							href={protocol.websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[11px] text-teal hover:underline flex items-center gap-1"
						>
							<Globe size={10} />
							Website
						</a>
					)}
				</div>
			</div>

			{/* Action */}
			<div className="shrink-0">
				{isActive ? (
					<Button
						variant="secondary"
						onClick={onUnsubscribe}
						disabled={isPending}
						className="text-xs px-3 h-8"
					>
						{isPending ? "…" : "Unsubscribe"}
					</Button>
				) : (
					<Button
						onClick={onResubscribe}
						disabled={isPending}
						className="text-xs px-3 h-8"
					>
						{isPending ? "…" : "Re-subscribe"}
					</Button>
				)}
			</div>
		</div>
	);
}
