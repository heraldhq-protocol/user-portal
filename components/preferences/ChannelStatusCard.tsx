"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface ChannelStatusCardProps {
	title: string;
	icon: IconType;
	status: "connected" | "disconnected" | "loading";
	description?: string;
	actionText: string;
	onAction: () => void;
	actionVariant?: "primary" | "secondary" | "outline";
	comingSoon?: boolean;
}

export function ChannelStatusCard({
	title,
	icon: Icon,
	status,
	description,
	actionText,
	onAction,
	actionVariant = "secondary",
	comingSoon = false,
}: ChannelStatusCardProps) {
	return (
		<Card className={cn("mb-4 group", status === "connected" && "group-hover:border-teal/50")}>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-teal/10 group-hover:dark:bg-teal/20">
						<Icon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-teal" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal">
							{title}
						</h3>
						<div className="mt-1 flex items-center gap-2">
							{status === "loading" ? (
								<Loader2 className="h-3 w-3 animate-spin text-slate-400" />
							) : (
								<>
									<span className="relative flex h-2 w-2">
										<span
											className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
												status === "connected" ? "animate-ping bg-green-400" : "bg-red-400"
											}`}
										/>
										<span
											className={`relative inline-flex h-2 w-2 rounded-full ${
												status === "connected" ? "bg-green-500" : "bg-red-500"
											}`}
										/>
									</span>
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
										{status}
									</span>
								</>
							)}
							{description && (
								<span className="text-xs text-slate-500 dark:text-slate-500">• {description}</span>
							)}
						</div>
					</div>
				</div>
				<Button
					variant={
						status === "connected" && actionVariant !== "secondary"
							? "primary"
							: comingSoon
								? "outline"
								: actionVariant
					}
					size="sm"
					onClick={onAction}
					disabled={status === "loading" || comingSoon}
					className={cn(
						comingSoon &&
							"border-dashed opacity-60 cursor-not-allowed hover:border-solid hover:bg-slate-100 hover:opacity-80",
						!comingSoon && actionVariant !== "secondary" && "hover:bg-teal/90",
						status === "connected" && actionVariant !== "secondary" && "hover:text-white"
					)}
				>
					{comingSoon ? "Coming soon" : actionText}
				</Button>
			</div>
		</Card>
	);
}
