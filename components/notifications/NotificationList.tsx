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
				<div className="flex items-center gap-2 bg-slate-50 dark:bg-navy-2 p-1 rounded-lg border border-slate-200 dark:border-border shrink-0 ml-4 hidden sm:flex">
					<button
						onClick={() => setTimeRange("all")}
						className={cn(
							"px-3 py-1 rounded-md text-[11px] font-semibold transition-colors",
							timeRange === "all"
								? "bg-white dark:bg-card border border-slate-200 dark:border-border text-white"
								: "text-slate-500 dark:text-text-muted border border-transparent hover:text-slate-700 dark:text-text-secondary"
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
								: "text-slate-500 dark:text-text-muted border border-transparent hover:text-slate-700 dark:text-text-secondary"
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
					<div className="text-center py-16">
						<div className="text-[32px] mb-3">📭</div>
						<p className="text-slate-500 dark:text-text-muted text-sm px-4">
							No notifications yet. You&apos;ll see them here once protocols start sending.
						</p>
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
