"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { type Notification, type NotificationCategory } from "@/types";
import { NotificationCard } from "./NotificationCard";

interface NotificationListProps {
	notifications: Notification[];
	isLoading: boolean;
}

const CATEGORIES: { value: "all" | NotificationCategory; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "defi", label: "DeFi" },
	{ value: "governance", label: "Governance" },
	{ value: "system", label: "System" },
	{ value: "marketing", label: "Marketing" },
];

export function NotificationList({ notifications, isLoading }: NotificationListProps) {
	const [category, setCategory] = useState<"all" | NotificationCategory>("all");
	const [timeRange, setTimeRange] = useState<"all" | "30d">("all");

	const filtered = useMemo(() => {
		return notifications.filter((n) => {
			if (category !== "all" && n.category !== category) return false;
			if (timeRange === "30d") {
				const date = new Date(n.deliveredAt || n.queuedAt);
				const thirtyDaysAgo = new Date();
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
				if (date < thirtyDaysAgo) return false;
			}
			return true;
		});
	}, [notifications, category, timeRange]);

	const parentRef = useRef<HTMLDivElement>(null);

	// eslint-disable-next-line react-hooks/incompatible-library
	const rowVirtualizer = useVirtualizer({
		count: isLoading ? 5 : filtered.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 110,
		overscan: 5,
	});

	// Ensure virtualization is recalculated on tab switch or loading state finish
	useEffect(() => {
		rowVirtualizer.measure();
	}, [rowVirtualizer, filtered.length, isLoading]);

	return (
		<div className="flex flex-col h-full">
			{/* Filter bar */}
			<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-border">
				<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
					{CATEGORIES.map((c) => (
						<button
							key={c.value}
							onClick={() => setCategory(c.value)}
							className={cn(
								"px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 border whitespace-nowrap",
								category === c.value
									? "bg-teal text-navy border-teal"
									: "bg-transparent text-slate-500 dark:text-text-muted border-slate-300 dark:border-border-2 hover:border-teal/50"
							)}
						>
							{c.label}
						</button>
					))}
				</div>
				<div className="items-center gap-2 bg-slate-50 dark:bg-navy-2 p-1 rounded-lg border border-slate-200 dark:border-border shrink-0 ml-4 hidden sm:flex">
					<button
						onClick={() => setTimeRange("all")}
						className={cn(
							"px-3 py-1 rounded-md text-[11px] font-semibold transition-colors",
							timeRange === "all"
								? "bg-white dark:bg-card border border-slate-200 dark:border-border text-white"
								: "text-slate-500 border border-transparent hover:text-slate-700 dark:text-text-secondary"
						)}
					>
						All time
					</button>
					<button
						onClick={() => setTimeRange("30d")}
						className={cn(
							"px-3 py-1 rounded-md text-[11px] font-semibold transition-colors",
							timeRange === "30d"
								? "bg-white dark:bg-card border border-slate-200 dark:border-border text-white"
								: "text-slate-500  border border-transparent hover:text-slate-700 dark:text-text-secondary"
						)}
					>
						Last 30 days
					</button>
				</div>
			</div>

			{/* List container */}
			<div ref={parentRef} className="flex-1 overflow-auto pr-2 custom-scrollbar">
				{isLoading ? (
					<div
						style={{
							height: `${rowVirtualizer.getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => (
							<div
								key={virtualRow.index}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
									paddingBottom: "10px",
								}}
							>
								<div className="animate-pulse flex gap-3.5 items-start p-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card h-full">
									<div className="w-2 h-2 rounded-full bg-border-2 mt-1.5 shrink-0" />
									<div className="flex-1 space-y-3 min-w-0">
										<div className="flex gap-2 justify-between">
											<div className="h-4 w-16 bg-border-2 rounded" />
											<div className="h-4 w-12 bg-border-2 rounded" />
										</div>
										<div className="h-4 w-3/4 bg-border-2 rounded" />
										<div className="h-3 w-1/3 bg-border-2 rounded mt-2" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
						{/* Styled bell icon with glow ring */}
						<div className="relative mb-6">
							<div className="absolute inset-0 rounded-full bg-teal/10 blur-xl scale-150" />
							<div className="relative w-20 h-20 rounded-2xl bg-slate-50 dark:bg-card-2 border border-slate-200 dark:border-border-2 flex items-center justify-center">
								<svg
									className="w-9 h-9 text-slate-300 dark:text-text-muted/50"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.2}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
									/>
								</svg>
							</div>
						</div>

						<h3 className="text-lg font-bold tracking-tight mb-2">
							No notifications yet
						</h3>
						<p className="text-sm text-slate-500 dark:text-text-muted leading-relaxed max-w-xs text-center mb-6">
							{category !== "all"
								? `No ${CATEGORIES.find((c) => c.value === category)?.label ?? category} notifications found. Try switching to "All" to see everything.`
								: "You\u2019ll see them here once Herald-integrated protocols start sending alerts to your wallet."}
						</p>

						{category !== "all" ? (
							<button
								onClick={() => setCategory("all")}
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-card border border-slate-200 dark:border-border-2 text-sm font-semibold text-slate-600 dark:text-text-secondary hover:border-teal/40 hover:text-teal transition-all duration-200 cursor-pointer"
							>
								Show all notifications
							</button>
						) : (
							<a
								href="https://useherald.xyz"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal/10 border border-teal/20 text-sm font-semibold text-teal hover:bg-teal/15 hover:border-teal/40 transition-all duration-200"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={2}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
									/>
								</svg>
								Explore Herald protocols
							</a>
						)}
					</div>
				) : (
					<div
						style={{
							height: `${rowVirtualizer.getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => (
							<div
								key={virtualRow.key}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
									paddingBottom: "10px",
								}}
							>
								<NotificationCard notification={filtered[virtualRow.index]} />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
