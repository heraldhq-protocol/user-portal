"use client";

import { useState } from "react";
import { Globe, Mail, MessageCircle, Smartphone, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { type ProtocolSubscription } from "@/types";
import {
	useProtocolPreferences,
	useUpdateProtocolPreferences,
} from "@/hooks/useProtocolSubscriptions";
import { cn } from "@/lib/utils";

const CHANNEL_ICONS: Record<string, React.ElementType> = {
	email: Mail,
	telegram: MessageCircle,
	sms: Smartphone,
};

const CATEGORY_KEYS = ["defi", "governance", "marketing", "system"] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

const CATEGORY_LABELS: Record<CategoryKey, string> = {
	defi: "DeFi",
	governance: "Governance",
	marketing: "Marketing",
	system: "System",
};

const PREF_KEYS: Record<CategoryKey, "optInDefi" | "optInGovernance" | "optInMarketing" | "optInSystem"> = {
	defi: "optInDefi",
	governance: "optInGovernance",
	marketing: "optInMarketing",
	system: "optInSystem",
};

interface PreferencesPanelProps {
	protocolId: string;
	availableCategories: string[];
	availableChannels: string[];
}

function PreferencesPanel({ protocolId, availableCategories, availableChannels }: PreferencesPanelProps) {
	const { data: prefs, isLoading } = useProtocolPreferences(protocolId);
	const update = useUpdateProtocolPreferences();

	const toggleCategory = (cat: CategoryKey) => {
		if (!prefs) return;
		const key = PREF_KEYS[cat];
		const current = prefs[key];
		// Cycle: null (inherit) → true → false → null
		const next = current === null ? true : current === true ? false : null;
		update.mutate({ protocolId, [key]: next });
	};

	const toggleChannel = (ch: string) => {
		if (!prefs) return;
		const next = prefs.channels.includes(ch)
			? prefs.channels.filter((c) => c !== ch)
			: [...prefs.channels, ch];
		update.mutate({ protocolId, channels: next });
	};

	if (isLoading) {
		return <div className="h-8 animate-pulse bg-border-2 rounded-lg mt-3" />;
	}

	return (
		<div className="mt-3 pt-3 border-t border-border space-y-3">
			{/* Category overrides */}
			{availableCategories.length > 0 && (
				<div>
					<p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-2">
						Categories <span className="font-normal normal-case">(null = inherit global)</span>
					</p>
					<div className="flex flex-wrap gap-1.5">
						{CATEGORY_KEYS.filter((c) => availableCategories.includes(c)).map((cat) => {
							const val = prefs?.[PREF_KEYS[cat]] ?? null;
							return (
								<button
									key={cat}
									onClick={() => toggleCategory(cat)}
									disabled={update.isPending}
									className={cn(
										"px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-60",
										val === true
											? "bg-teal/15 text-teal border-teal/30"
											: val === false
											? "bg-herald-red/10 text-[#EF4444] border-herald-red/20 line-through"
											: "bg-transparent text-text-muted border-border-2 hover:border-teal/40"
									)}
								>
									{CATEGORY_LABELS[cat]}
									{val === null && <span className="ml-1 opacity-50">~</span>}
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Channel overrides */}
			{availableChannels.length > 0 && (
				<div>
					<p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-2">
						Channel overrides <span className="font-normal normal-case">(empty = inherit)</span>
					</p>
					<div className="flex flex-wrap gap-1.5">
						{availableChannels.map((ch) => {
							const Icon = CHANNEL_ICONS[ch] ?? Globe;
							const active = prefs?.channels.includes(ch) ?? false;
							return (
								<button
									key={ch}
									onClick={() => toggleChannel(ch)}
									disabled={update.isPending}
									className={cn(
										"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-60 capitalize",
										active
											? "bg-teal/15 text-teal border-teal/30"
											: "bg-transparent text-text-muted border-border-2 hover:border-teal/40"
									)}
								>
									<Icon size={11} />
									{ch}
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

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
	const [showPrefs, setShowPrefs] = useState(false);
	const { protocol, status, channels, subscribedAt } = subscription;
	const categories = protocol.categories;
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
				"p-4 rounded-xl border transition-all duration-200",
				isActive
					? "bg-bg-elevated border-border"
					: "bg-bg-surface border-border opacity-60"
			)}
		>
			<div className="flex items-start gap-4">
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

				{/* Actions */}
				<div className="shrink-0 flex flex-col items-end gap-2">
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

					{isActive && (
						<button
							onClick={() => setShowPrefs((v) => !v)}
							className="flex items-center gap-1 text-[10px] font-semibold text-text-muted hover:text-teal transition-colors cursor-pointer"
						>
							{showPrefs ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
							Preferences
						</button>
					)}
				</div>
			</div>

			{/* Expandable preferences */}
			{isActive && showPrefs && (
				<PreferencesPanel
					protocolId={subscription.protocolId}
					availableCategories={categories}
					availableChannels={channels.length > 0 ? channels : ["email", "telegram", "sms"]}
				/>
			)}
		</div>
	);
}
