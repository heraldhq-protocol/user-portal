/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, ArrowLeft, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { ChannelUserClient, type SolanaCluster } from "@herald-protocol/sdk";
import { getGatewayEnclavePubkey } from "@/lib/crypto";

const SESSION_KEY = "tg_connect";
const POLL_TIMEOUT = 60_000;

export default function TelegramSetupPage() {
	const { publicKey, signTransaction } = useWallet();
	const { connection } = useConnection();
	const router = useRouter();

	const [isGenerating, setIsGenerating] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const [copied, setCopied] = useState(false);
	const [pollTimeout, setPollTimeout] = useState(false);

	const [connectUrl, setConnectUrl] = useState<string | null>(() => {
		try {
			const saved = sessionStorage.getItem(SESSION_KEY);
			return saved ? (JSON.parse(saved).connectUrl ?? null) : null;
		} catch { return null; }
	});
	const [nonce, setNonce] = useState<string | null>(() => {
		try {
			const saved = sessionStorage.getItem(SESSION_KEY);
			return saved ? (JSON.parse(saved).nonce ?? null) : null;
		} catch { return null; }
	});
	const [isPolling, setIsPolling] = useState<boolean>(() => {
		try {
			const saved = sessionStorage.getItem(SESSION_KEY);
			return saved ? !!JSON.parse(saved).nonce : false;
		} catch { return false; }
	});

	const clearSession = () => sessionStorage.removeItem(SESSION_KEY);

	const registerOnChain = useCallback(async (chatId: string) => {
		if (!publicKey || !signTransaction) {
			toast.error("Wallet not connected");
			return;
		}

		const sendAndConfirmWithRetry = async (instructions: any[], attempt = 1): Promise<string> => {
			const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
			const tx = new Transaction().add(...instructions);
			tx.recentBlockhash = blockhash;
			tx.feePayer = publicKey;

			const signedTx = await signTransaction(tx);
			const signature = await connection.sendRawTransaction(signedTx.serialize(), {
				skipPreflight: true,
				maxRetries: 3,
			});

			try {
				await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
				return signature;
			} catch (err: unknown) {
				const isExpired = err instanceof Error && err.name === "TransactionExpiredBlockheightExceededError";
				if (isExpired && attempt < 3) {
					toast.info(`Network slow — retrying (${attempt}/3)...`);
					return sendAndConfirmWithRetry(instructions, attempt + 1);
				}
				throw err;
			}
		};

		setIsRegistering(true);
		try {
			const client = new ChannelUserClient({
				cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as SolanaCluster) || "devnet",
				rpcUrl: connection.rpcEndpoint,
			});

			const { instructions } = await client.buildTelegramRegistrationTx(
				publicKey,
				chatId,
				getGatewayEnclavePubkey(),
			);
			await sendAndConfirmWithRetry(instructions);

			clearSession();
			await fetchApi("/portal/identity", { method: "POST" });
			toast.success("Telegram connected and registered on-chain!");
			router.push("/preferences");
		} catch (err: any) {
			console.error(err);
			toast.error(err.message || "Failed to register Telegram on-chain");
			clearSession();
			setConnectUrl(null);
			setNonce(null);
			setIsPolling(false);
		} finally {
			setIsRegistering(false);
		}
	}, [publicKey, signTransaction, connection, router]);

	const pollForChatId = useCallback(async () => {
		if (!nonce) return null;
		try {
			const res = await fetchApi<{ status: string; chatId?: string }>(
				`/portal/channels/telegram/poll?nonce=${nonce}`
			);

			if (res.status === "completed" && res.chatId) {
				setIsPolling(false);
				await registerOnChain(res.chatId);
				return res.chatId;
			} else if (res.status === "expired") {
				setIsPolling(false);
				clearSession();
				toast.error("Link expired. Please generate a new one.");
				setConnectUrl(null);
				setNonce(null);
			}
		} catch (err) {
			console.error("Poll error:", err);
		}
		return null;
	}, [nonce, registerOnChain]);

	useEffect(() => {
		if (!nonce || !isPolling) return;

		let cancelled = false;

		const poll = async () => {
			if (cancelled) return;
			await pollForChatId();
		};

		const onVisibilityChange = () => {
			if (document.visibilityState === "visible") poll();
		};

		document.addEventListener("visibilitychange", onVisibilityChange);
		const intervalId = setInterval(poll, 3000);

		const timeoutId = setTimeout(() => {
			if (isPolling && !cancelled) {
				setPollTimeout(true);
				setIsPolling(false);
				toast.error("Timed out waiting for Telegram. You can try again.");
			}
		}, POLL_TIMEOUT);

		return () => {
			cancelled = true;
			clearInterval(intervalId);
			clearTimeout(timeoutId);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, [nonce, isPolling, pollForChatId]);

	const handleConnect = async () => {
		setIsGenerating(true);
		setPollTimeout(false);
		try {
			const res = await fetchApi<{ nonce: string; connectUrl: string }>(
				"/portal/channels/telegram/connect"
			);

			sessionStorage.setItem(SESSION_KEY, JSON.stringify({ nonce: res.nonce, connectUrl: res.connectUrl }));

			setNonce(res.nonce);
			setConnectUrl(res.connectUrl);
			setIsPolling(true);

			try {
				window.open(res.connectUrl, "_blank", "noopener,noreferrer");
			} catch {
			}
		} catch (err: any) {
			toast.error(err.message || "Failed to generate connect link");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleRetry = () => {
		setPollTimeout(false);
		setIsPolling(true);
	};

	const handleManualCheck = async () => {
		await pollForChatId();
	};

	const handleCopyLink = async () => {
		if (!connectUrl) return;
		await navigator.clipboard.writeText(connectUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleCancel = () => {
		clearSession();
		setConnectUrl(null);
		setNonce(null);
		setIsPolling(false);
		setPollTimeout(false);
	};

	return (
		<div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-12">
			<Button
				variant="outline"
				size="sm"
				onClick={() => router.push("/preferences")}
				className="mb-6 h-8"
			>
				<ArrowLeft className="mr-2 size-4" />
				Back to Preferences
			</Button>

			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				<div className="mb-6 sm:mb-8">
					<h1 className="text-xl sm:text-[28px] font-extrabold tracking-tight mb-2 flex items-center gap-2">
						<FaTelegramPlane className="size-6 sm:size-8 text-[#0088cc] shrink-0" />
						Connect Telegram
					</h1>
					<p className="text-text-muted text-sm sm:text-base">
						Receive high-priority alerts like liquidation warnings directly via Telegram. Your chat
						ID is encrypted before being stored on-chain.
					</p>
				</div>

				<Card className="flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6 text-center">
					{!connectUrl ? (
						<>
							<div className="size-14 sm:size-16 bg-[#0088cc15] text-[#0088cc] rounded-full flex items-center justify-center mb-5 sm:mb-6">
								<FaTelegramPlane className="size-7 sm:size-8" />
							</div>
							<h3 className="text-lg sm:text-xl font-bold mb-2">Ready to connect?</h3>
							<p className="text-text-muted text-xs sm:text-sm max-w-sm mb-6 sm:mb-8">
								Click the button below to open Telegram and send the initialization command to our
								secure bot.
							</p>
							<Button onClick={handleConnect} disabled={isGenerating} className="w-full sm:w-auto">
								{isGenerating ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
								Generate Link & Open Telegram
							</Button>
						</>
					) : (
						<>
							<div className="size-14 sm:size-16 bg-card-2 text-text-muted rounded-full flex items-center justify-center mb-5 sm:mb-6">
								<Loader2 className="size-7 sm:size-8 animate-spin" />
							</div>
							<h3 className="text-lg sm:text-xl font-bold mb-2">
								{isRegistering
									? "Securing on-chain..."
									: pollTimeout
										? "Timed out"
										: "Waiting for Telegram..."}
							</h3>
							<p className="text-text-muted text-xs sm:text-sm max-w-sm mb-5 sm:mb-6">
								{isRegistering
									? "Your Telegram is connected! Please approve the wallet transaction to complete registration."
									: pollTimeout
										? "We didn't detect a response. Make sure you messaged the bot and try again."
										: "We're waiting for you to click Start in Telegram. This ensures we have the right account."}
							</p>

							{!isRegistering && (
								<div className="w-full max-w-sm space-y-3">
									<div className="flex items-center gap-2 px-3 py-2 bg-card-2 rounded-lg w-full min-w-0">
										<p className="text-xs text-text-muted truncate flex-1 min-w-0 font-mono">
											{connectUrl}
										</p>
										<Button
											variant="ghost"
											size="sm"
											className="size-7 p-0 shrink-0"
											onClick={handleCopyLink}
										>
											{copied ? (
												<Check className="size-3.5 text-herald-green" />
											) : (
												<Copy className="size-3.5" />
											)}
										</Button>
									</div>

									<a
										href={connectUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-lg border border-border-2 bg-card text-text-primary hover:border-[#0088cc]/50 transition-colors"
									>
										<ExternalLink className="size-4" />
										Open in Telegram
									</a>

									<div className="flex gap-2 justify-center pt-2">
										{pollTimeout ? (
											<Button variant="primary" size="sm" onClick={handleRetry} className="gap-1.5">
												<RefreshCw className="size-3.5" />
												Try Again
											</Button>
										) : (
											<Button variant="secondary" size="sm" onClick={handleManualCheck}>
												I&apos;ve Messaged the Bot
											</Button>
										)}
										<Button variant="ghost" size="sm" onClick={handleCancel}>
											Cancel
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</Card>
			</motion.div>
		</div>
	);
}
