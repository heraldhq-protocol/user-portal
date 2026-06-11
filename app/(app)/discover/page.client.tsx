"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Globe, Check, Plus, Loader2, Search, BadgeCheck, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type DiscoverableProtocol, type NotificationCategory } from "@/types";
import {
	useDiscoverProtocols,
	useSubscribeToProtocol,
	useDiscoverUnsubscribe,
} from "@/hooks/useProtocolSubscriptions";

const CATEGORY_LABELS: Record<string, string> = {
	defi: "DeFi",
	governance: "Governance",
	marketing: "Marketing",
	system: "System",
};

const CATEGORY_COLORS: Record<string, string> = {
	defi: "bg-teal/10 text-teal border-teal/20",
	governance: "bg-purple-500/10 text-purple-400 border-purple-500/20",
	marketing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	system: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const FILTER_CATEGORIES = [
	{ value: "all", label: "All" },
	{ value: "defi", label: "DeFi" },
	{ value: "governance", label: "Governance" },
	{ value: "marketing", label: "Marketing" },
	{ value: "system", label: "System" },
];

function ProtocolCard({ protocol }: { protocol: DiscoverableProtocol }) {
	const subscribe = useSubscribeToProtocol();
	const unsubscribe = useDiscoverUnsubscribe();
	const isPending = subscribe.isPending || unsubscribe.isPending;
	const [copied, setCopied] = useState(false);

	const handleShare = () => {
		const url = `https://notify.useherald.xyz/join/${protocol.protocolId}`;
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}).catch(() => {});
	};

	const handleToggle = () => {
		if (isPending) return;
		if (protocol.isSubscribed) {
			unsubscribe.mutate(protocol.protocolId);
		} else {
			subscribe.mutate(protocol.protocolId);
		}
	};

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-border-2 transition-colors"
		>
			{/* Logo / fallback */}
			<div className="w-11 h-11 rounded-xl bg-navy-2 border border-border-2 flex items-center justify-center shrink-0 overflow-hidden">
				{protocol.logoUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={protocol.logoUrl} alt={protocol.name} className="w-full h-full object-contain" />
				) : (
					<span className="text-base font-bold text-text-muted">
						{protocol.name.charAt(0).toUpperCase()}
					</span>
				)}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<div className="flex items-center gap-1.5">
							<p className="text-sm font-bold text-text-primary truncate">{protocol.name}</p>
							{protocol.isVerified && (
								<BadgeCheck className="size-4 text-teal shrink-0" aria-label="Verified protocol" />
							)}
						</div>
						{protocol.websiteUrl && (
							<a
								href={protocol.websiteUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-teal transition-colors mt-0.5"
							>
								<Globe className="size-3" />
								{new URL(protocol.websiteUrl).hostname.replace(/^www\./, "")}
							</a>
						)}
					</div>

					<div className="flex items-center gap-2 shrink-0">
						<button
							onClick={handleShare}
							title="Copy join link"
							className="p-1.5 rounded-lg text-text-muted border border-border-2 hover:text-teal hover:border-teal/40 transition-colors cursor-pointer"
						>
							{copied ? <Check className="size-3 text-teal" /> : <Share2 className="size-3" />}
						</button>
						<button
							onClick={handleToggle}
							disabled={isPending}
							className={cn(
								"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 border shrink-0 cursor-pointer disabled:opacity-60",
								protocol.isSubscribed
									? "bg-teal/10 text-teal border-teal/30 hover:bg-herald-red/10 hover:text-[#EF4444] hover:border-herald-red/30"
									: "bg-teal text-navy border-transparent hover:bg-teal-2"
							)}
						>
							{isPending ? (
								<Loader2 className="size-3 animate-spin" />
							) : protocol.isSubscribed ? (
								<Check className="size-3" />
							) : (
								<Plus className="size-3" />
							)}
							{protocol.isSubscribed ? "Subscribed" : "Subscribe"}
						</button>
					</div>
				</div>

				{/* Categories */}
				{protocol.categories.length > 0 && (
					<div className="flex flex-wrap gap-1.5 mt-2.5">
						{protocol.categories.map((cat) => (
							<span
								key={cat}
								className={cn(
									"px-2 py-0.5 rounded-full text-[10px] font-semibold border",
									CATEGORY_COLORS[cat] ?? "bg-border/40 text-text-muted border-border"
								)}
							>
								{CATEGORY_LABELS[cat as NotificationCategory] ?? cat}
							</span>
						))}
					</div>
				)}
			</div>
		</motion.div>
	);
}

export default function DiscoverPageClient() {
	const { data: protocols = [], isLoading, error } = useDiscoverProtocols();
	const [search, setSearch] = useState("");
	const [filterCategory, setFilterCategory] = useState<string>("all");
	const [filterStatus, setFilterStatus] = useState<"all" | "subscribed" | "unsubscribed">("all");
	const [verifiedOnly, setVerifiedOnly] = useState(false);

	const filtered = protocols.filter((p) => {
		if (search) {
			const q = search.toLowerCase();
			if (!p.name.toLowerCase().includes(q) && !(p.websiteUrl ?? "").toLowerCase().includes(q)) return false;
		}
		if (filterCategory !== "all" && !p.categories.includes(filterCategory)) return false;
		if (filterStatus === "subscribed" && !p.isSubscribed) return false;
		if (filterStatus === "unsubscribed" && p.isSubscribed) return false;
		if (verifiedOnly && !p.isVerified) return false;
		return true;
	});

	const subscribedCount = protocols.filter((p) => p.isSubscribed).length;

	return (
		<div className="max-w-[700px] mx-auto px-4 sm:px-6 py-8 sm:py-12 font-sans">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-[28px] font-extrabold tracking-tight">Discover protocols</h1>
					<p className="text-sm text-text-muted mt-1">
						{isLoading
							? "Loading protocols..."
							: `${protocols.length} protocol${protocols.length !== 1 ? "s" : ""} on Herald${subscribedCount > 0 ? ` · ${subscribedCount} subscribed` : ""}`}
					</p>
				</div>

				{/* Filters */}
				<div className="flex flex-col gap-3 mb-6">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search protocols..."
							className="w-full pl-9 pr-3 py-2 rounded-lg bg-navy-2 border border-border-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-teal/50 transition-colors"
						/>
					</div>

					{/* Category pills + right-side toggles */}
					<div className="flex flex-wrap items-center gap-2">
						{FILTER_CATEGORIES.map((c) => (
							<button
								key={c.value}
								onClick={() => setFilterCategory(c.value)}
								className={cn(
									"px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 border whitespace-nowrap",
									filterCategory === c.value
										? "bg-teal text-navy border-teal"
										: "bg-transparent text-text-muted border-border-2 hover:border-teal/50"
								)}
							>
								{c.label}
							</button>
						))}

						{/* Verified + subscription status pushed to the right */}
						<div className="ml-auto flex items-center gap-2">
							<button
								onClick={() => setVerifiedOnly((v) => !v)}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap",
									verifiedOnly
										? "bg-teal/10 text-teal border-teal/30"
										: "bg-transparent text-text-muted border-border-2 hover:border-teal/40"
								)}
							>
								<BadgeCheck className="size-3.5" />
								Verified
							</button>

							<div className="flex items-center gap-1 bg-navy-2 p-1 rounded-lg border border-border">
								{(["all", "subscribed", "unsubscribed"] as const).map((s) => (
									<button
										key={s}
										onClick={() => setFilterStatus(s)}
										className={cn(
											"px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors capitalize cursor-pointer",
											filterStatus === s
												? "bg-card border border-border text-white"
												: "text-text-muted border border-transparent hover:text-text-secondary"
										)}
									>
										{s}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Content */}
				{isLoading ? (
					<div className="flex flex-col gap-3">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="animate-pulse flex gap-4 p-5 rounded-xl border border-border bg-card h-[88px]">
								<div className="w-11 h-11 rounded-xl bg-border-2 shrink-0" />
								<div className="flex-1 space-y-2.5">
									<div className="h-4 w-32 bg-border-2 rounded" />
									<div className="h-3 w-20 bg-border-2 rounded" />
								</div>
							</div>
						))}
					</div>
				) : error ? (
					<div className="flex flex-col items-center py-16 text-center">
						<p className="text-sm text-herald-red font-semibold">Failed to load protocols</p>
						<p className="text-xs text-text-muted mt-1">{error instanceof Error ? error.message : "Unknown error"}</p>
					</div>
				) : filtered.length === 0 ? (
					<div className="flex flex-col items-center py-16 text-center">
						<p className="text-sm text-text-secondary font-semibold">No protocols found</p>
						<p className="text-xs text-text-muted mt-1">
							{search ? `No results for "${search}"` : "Try adjusting your filters"}
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{filtered.map((p, i) => (
							<motion.div
								key={p.protocolId}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: Math.min(i * 0.04, 0.3) }}
							>
								<ProtocolCard protocol={p} />
							</motion.div>
						))}
					</div>
				)}
			</motion.div>
		</div>
	);
}
