"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconType } from "react-icons";

interface ChannelStatusCardProps {
	title: string;
	icon: IconType;
	status: "connected" | "disconnected" | "loading";
	description?: string;
	actionText: string;
	onAction: () => void;
	actionVariant?: "primary" | "secondary" | "outline";
}

export function ChannelStatusCard({
	title,
	icon: Icon,
	status,
	description,
	actionText,
	onAction,
	actionVariant = "secondary",
}: ChannelStatusCardProps) {
	return (
		<Card className="mb-4">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
						<Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
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
					variant={actionVariant}
					size="sm"
					onClick={onAction}
					disabled={status === "loading"}
					className="cursor-pointer bg-teal"
				>
					{actionText}
				</Button>
			</div>
		</Card>
	);
}
