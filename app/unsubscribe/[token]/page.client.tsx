/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BellOff, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

type PreviewData = {
	walletPrefix: string;
	category?: string;
	valid: boolean;
};

type ResultData = {
	success: boolean;
	txSignature?: string;
	alreadyOptedOut: boolean;
};

export default function UnsubscribePage() {
	const params = useParams<{ token: string }>();
	const token = params?.token;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<PreviewData | null>(null);

	const [unsubscribing, setUnsubscribing] = useState(false);
	const [result, setResult] = useState<ResultData | null>(null);

	useEffect(() => {
		if (!token) return;
		async function loadPreview() {
			try {
				const data = await fetchApi<PreviewData>(`/portal/unsubscribe/${token}`);
				setPreview(data);
			} catch (err: any) {
				setError(err.message || "Invalid or expired unsubscribe link.");
			} finally {
				setLoading(false);
			}
		}
		loadPreview();
	}, [token]);

	const handleUnsubscribe = async () => {
		setUnsubscribing(true);
		try {
			const data = await fetchApi<ResultData>(`/portal/unsubscribe/${token}`, {
				method: "POST",
			});
			setResult(data);
		} catch (err: any) {
			setError(err.message || "Failed to unsubscribe. Please try again.");
		} finally {
			setUnsubscribing(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-md"
			>
				<Card className="p-8 text-center shadow-xl">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-teal mb-4" />
							<p className="text-slate-500">Validating link...</p>
						</div>
					) : error ? (
						<div className="flex flex-col items-center">
							<div className="h-12 w-12 rounded-full bg-red/10 flex items-center justify-center mb-4">
								<AlertTriangle className="h-6 w-6 text-red" />
							</div>
							<h1 className="text-xl font-bold mb-2">Link Expired</h1>
							<p className="text-slate-500 mb-6">{error}</p>
						</div>
					) : result ? (
						<div className="flex flex-col items-center">
							<div className="h-12 w-12 rounded-full bg-teal/10 flex items-center justify-center mb-4">
								<CheckCircle2 className="h-6 w-6 text-[#00E599]" />
							</div>
							<h1 className="text-xl font-bold mb-2">Unsubscribed Successfully</h1>
							{result.alreadyOptedOut ? (
								<p className="text-slate-500 mb-6">
									You were already opted out of these notifications.
								</p>
							) : (
								<p className="text-slate-500 mb-6 text-sm">
									Your preferences have been updated. You will no longer receive{" "}
									{preview?.category ? (
										<span className="font-semibold text-slate-800 dark:text-slate-200">
											{preview.category}
										</span>
									) : (
										"these"
									)}{" "}
									notifications for wallet{" "}
									<span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">
										{preview?.walletPrefix}...
									</span>
									.
								</p>
							)}
							{result.txSignature && (
								<a
									href={`https://explorer.solana.com/tx/${result.txSignature}?cluster=devnet`}
									target="_blank"
									rel="noreferrer"
									className="text-xs text-[#00E599] hover:underline mb-2 block"
								>
									View on Explorer
								</a>
							)}
						</div>
					) : preview ? (
						<div className="flex flex-col items-center">
							<div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
								<BellOff className="h-6 w-6 text-slate-600 dark:text-slate-400" />
							</div>
							<h1 className="text-xl font-bold mb-2">Confirm Unsubscribe</h1>
							<p className="text-slate-500 text-sm mb-8">
								Are you sure you want to stop receiving{" "}
								{preview.category ? (
									<span className="font-semibold text-slate-800 dark:text-slate-200">
										{preview.category}
									</span>
								) : (
									"these"
								)}{" "}
								notifications for wallet{" "}
								<span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">
									{preview.walletPrefix}...
								</span>
								?
							</p>

							<div className="flex flex-col w-full gap-3">
								<Button onClick={handleUnsubscribe} disabled={unsubscribing} className="w-full">
									{unsubscribing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
									Yes, please unsubscribe me
								</Button>
							</div>
						</div>
					) : null}
				</Card>
			</motion.div>
		</div>
	);
}
