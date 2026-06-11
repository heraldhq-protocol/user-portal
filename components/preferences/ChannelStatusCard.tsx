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
	comingSoon?: boolean;
}

export function ChannelStatusCard({
	title,
	icon: Icon,
	status,
	description,
	actionText,
	onAction,
	comingSoon = false,
}: ChannelStatusCardProps) {
	const actionVariant = comingSoon ? "outline" : status === "disconnected" ? "primary" : "secondary";
	return (
		<Card className={cn("mb-4 group", status === "connected" && "group-hover:border-teal/50")}>
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card-2 group-hover:bg-teal/10">
						<Icon className="size-5 shrink-0 text-text-muted group-hover:text-teal" />
					</div>
					<div className="flex-1">
						<h3 className="text-sm font-bold text-text-primary group-hover:text-teal">
							{title}
						</h3>
						<div className="mt-1 flex items-center gap-2">
							{status === "loading" ? (
								<Loader2 className="size-3 animate-spin text-text-muted" />
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
									<span className="text-xs font-medium text-text-muted capitalize">
										{status}
									</span>
								</>
							)}
							{description && (
								<span className="text-xs text-text-muted">• {description}</span>
							)}
						</div>
					</div>
				</div>
				<Button
					variant={actionVariant}
					size="sm"
					onClick={onAction}
					disabled={status === "loading" || comingSoon}
					className={cn(
						"w-full sm:w-auto shrink-0",
						comingSoon && "border-dashed opacity-60 cursor-not-allowed"
					)}
				>
					{comingSoon ? "Coming soon" : actionText}
				</Button>
			</div>
		</Card>
	);
}
