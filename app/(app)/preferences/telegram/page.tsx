/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { ChannelUserClient, type SolanaCluster } from "@herald-protocol/sdk";

export default function TelegramSetupPage() {
	const { publicKey, signTransaction } = useWallet();
	const { connection } = useConnection();
	const router = useRouter();

	const [isGenerating, setIsGenerating] = useState(false);
	const [connectUrl, setConnectUrl] = useState<string | null>(null);
	const [nonce, setNonce] = useState<string | null>(null);
	const [isPolling, setIsPolling] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const [copied, setCopied] = useState(false);

	const registerOnChain = async (chatId: string) => {
		if (!publicKey || !signTransaction) {
			toast.error("Wallet not connected");
			return;
		}

		setIsRegistering(true);
		try {
			const client = new ChannelUserClient({
				cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as SolanaCluster) || "devnet",
				rpcUrl: connection.rpcEndpoint,
			});

			const { instructions } = await client.buildTelegramRegistrationTx(publicKey, chatId);

			const tx = new Transaction().add(...instructions);
			tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
			tx.feePayer = publicKey;

			const signedTx = await signTransaction(tx);
			const signature = await connection.sendRawTransaction(signedTx.serialize());

			const latestBlockhash = await connection.getLatestBlockhash();
			await connection.confirmTransaction(
				{
					signature,
					blockhash: latestBlockhash.blockhash,
					lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
				},
				"confirmed"
			);

			// Tell API to index changes
			await fetchApi("/portal/identity", { method: "POST" });
			toast.success("Telegram connected and registered on-chain!");
			router.push("/preferences");
		} catch (err: any) {
			console.error(err);
			toast.error(err.message || "Failed to register Telegram on-chain");
		} finally {
			setIsRegistering(false);
		}
	};

	// Start polling when nonce changes
	useEffect(() => {
		if (!nonce || !isPolling) return;

		// eslint-disable-next-line prefer-const
		let intervalId: NodeJS.Timeout;

		const poll = async () => {
			try {
				const res = await fetchApi<{ status: string; chatId?: string }>(
					`/portal/channels/telegram/poll?nonce=${nonce}`
				);

				if (res.status === "completed" && res.chatId) {
					setIsPolling(false);
					clearInterval(intervalId);
					await registerOnChain(res.chatId);
				} else if (res.status === "expired") {
					setIsPolling(false);
					clearInterval(intervalId);
					toast.error("Link expired. Please generate a new one.");
					setConnectUrl(null);
					setNonce(null);
				}
			} catch (err) {
				console.error("Poll error:", err);
			}
		};

		intervalId = setInterval(poll, 3000);
		return () => clearInterval(intervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nonce, isPolling]);

	const handleConnect = async () => {
		setIsGenerating(true);
		try {
			const res = await fetchApi<{ nonce: string; connectUrl: string }>(
				"/portal/channels/telegram/connect"
			);
			setNonce(res.nonce);
			setConnectUrl(res.connectUrl);
			setIsPolling(true);

			// On mobile in-app browsers (Phantom), opening _blank can lose state.
			// Use a slightly delayed window.open to avoid blocking.
			// The link is always visible so users can tap it manually.
			try {
				window.open(res.connectUrl, "_blank", "noopener,noreferrer");
			} catch {
				// Some in-app browsers block window.open — that's OK,
				// the link is shown in the UI for manual tap.
			}
		} catch (err: any) {
			toast.error(err.message || "Failed to generate connect link");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCopyLink = async () => {
		if (!connectUrl) return;
		await navigator.clipboard.writeText(connectUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-12">
			<Button
				variant="outline"
				size="sm"
				onClick={() => router.push("/preferences")}
				className="mb-6 h-8"
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Preferences
			</Button>

			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				<div className="mb-6 sm:mb-8">
					<h1 className="text-xl sm:text-[28px] font-extrabold tracking-tight mb-2 flex items-center gap-2">
						<FaTelegramPlane className="h-6 w-6 sm:h-8 sm:w-8 text-[#0088cc] shrink-0" />
						Connect Telegram
					</h1>
					<p className="text-slate-500 text-sm sm:text-base">
						Receive high-priority alerts like liquidation warnings directly via Telegram. Your chat
						ID is encrypted before being stored on-chain.
					</p>
				</div>

				<Card className="flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6 text-center">
					{!connectUrl ? (
						<>
							<div className="h-14 w-14 sm:h-16 sm:w-16 bg-[#0088cc15] text-[#0088cc] rounded-full flex items-center justify-center mb-5 sm:mb-6">
								<FaTelegramPlane className="h-7 w-7 sm:h-8 sm:w-8" />
							</div>
							<h3 className="text-lg sm:text-xl font-bold mb-2">Ready to connect?</h3>
							<p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-6 sm:mb-8">
								Click the button below to open Telegram and send the initialization command to our
								secure bot.
							</p>
							<Button onClick={handleConnect} disabled={isGenerating} className="w-full sm:w-auto">
								{isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
								Generate Link & Open Telegram
							</Button>
						</>
					) : (
						<>
							<div className="h-14 w-14 sm:h-16 sm:w-16 bg-slate-100 dark:bg-card-2 text-slate-500 rounded-full flex items-center justify-center mb-5 sm:mb-6">
								<Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin" />
							</div>
							<h3 className="text-lg sm:text-xl font-bold mb-2">
								{isRegistering ? "Securing on-chain..." : "Waiting for Telegram..."}
							</h3>
							<p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-5 sm:mb-6">
								{isRegistering
									? "Your Telegram is connected! Please approve the wallet transaction to complete registration."
									: "We're waiting for you to click Start in Telegram. This ensures we have the right account."}
							</p>
							{!isRegistering && (
								<div className="w-full max-w-sm space-y-3">
									{/* Link display — constrained to prevent overflow */}
									<div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-card-2 rounded-lg w-full min-w-0">
										<p className="text-xs text-slate-500 truncate flex-1 min-w-0 font-mono">
											{connectUrl}
										</p>
										<Button
											variant="ghost"
											size="sm"
											className="h-7 w-7 p-0 shrink-0"
											onClick={handleCopyLink}
										>
											{copied ? (
												<Check className="h-3.5 w-3.5 text-green-500" />
											) : (
												<Copy className="h-3.5 w-3.5" />
											)}
										</Button>
									</div>

									{/* Open in Telegram button */}
									<a
										href={connectUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-border-2 bg-white dark:bg-card text-slate-700 dark:text-text-primary hover:border-[#0088cc]/50 transition-colors"
									>
										<ExternalLink className="h-4 w-4" />
										Open in Telegram
									</a>
								</div>
							)}
						</>
					)}
				</Card>
			</motion.div>
		</div>
	);
}
