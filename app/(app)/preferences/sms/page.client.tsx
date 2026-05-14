/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, ArrowLeft, Smartphone, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { ChannelUserClient, type SolanaCluster } from "@herald-protocol/sdk";
import { PhoneInput } from "@/components/ui/phone-input";

const RESEND_COOLDOWN = 30;

export default function SmsSetupPage() {
	const { publicKey, signTransaction } = useWallet();
	const { connection } = useConnection();
	const router = useRouter();

	const [phone, setPhone] = useState("+1");
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState<"phone" | "otp" | "registering">("phone");
	const [isSending, setIsSending] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const otpInputRef = useRef<HTMLInputElement>(null);
	const cooldownRef = useRef<ReturnType<typeof setInterval>>();

	useEffect(() => {
		if (step === "otp" && otpInputRef.current) {
			otpInputRef.current.focus();
		}
	}, [step]);

	useEffect(() => {
		if (resendCooldown > 0) {
			cooldownRef.current = setInterval(() => {
				setResendCooldown((prev) => {
					if (prev <= 1) {
						clearInterval(cooldownRef.current);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => clearInterval(cooldownRef.current);
	}, [resendCooldown]);

	const phoneRegex = /^\+[1-9]\d{1,14}$/;

	const registerOnChain = async () => {
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

		setStep("registering");
		try {
			const client = new ChannelUserClient({
				cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as SolanaCluster) || "devnet",
				rpcUrl: connection.rpcEndpoint,
			});

			const { instructions } = await client.buildSmsRegistrationTx(publicKey, phone);
			await sendAndConfirmWithRetry(instructions);

			await fetchApi("/portal/identity", { method: "POST" });
			toast.success("Phone number verified and registered on-chain!");
			router.push("/preferences");
		} catch (err: any) {
			console.error(err);
			toast.error(err.message || "Failed to register phone on-chain");
			setStep("otp");
		}
	};

	const handleSendOtp = useCallback(async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!phoneRegex.test(phone)) {
			toast.error("Please enter a valid international phone number (e.g., +1234567890)");
			return;
		}

		setIsSending(true);
		try {
			await fetchApi("/portal/channels/sms/send-otp", {
				method: "POST",
				body: JSON.stringify({ phone }),
			});
			setStep("otp");
			setResendCooldown(RESEND_COOLDOWN);
			toast.success("Verification code sent via SMS");
		} catch (err: any) {
			toast.error(err.message || "Failed to send code");
		} finally {
			setIsSending(false);
		}
	}, [phone]);

	const handleVerifyOtp = useCallback(async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (otp.length < 6) return;

		setIsVerifying(true);
		try {
			await fetchApi("/portal/channels/sms/verify-otp", {
				method: "POST",
				body: JSON.stringify({ phone, code: otp }),
			});

			await registerOnChain();
		} catch (err: any) {
			toast.error(err.message || "Invalid or expired code");
			setIsVerifying(false);
		}
	}, [phone, otp, registerOnChain]);

	const handleOtpChange = (value: string) => {
		const digits = value.replace(/\D/g, "").slice(0, 6);
		setOtp(digits);
		if (digits.length === 6) {
			setTimeout(() => handleVerifyOtp(), 100);
		}
	};

	const handleOtpPaste = (e: React.ClipboardEvent) => {
		const text = e.clipboardData.getData("text");
		const digits = text.replace(/\D/g, "").slice(0, 6);
		if (digits.length === 6) {
			setOtp(digits);
			setTimeout(() => handleVerifyOtp(), 100);
		}
	};

	return (
		<div className="max-w-160 mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
				<div className="mb-8">
					<h1 className="text-[28px] font-extrabold tracking-tight mb-2 flex items-center gap-2">
						<Smartphone className="size-8 text-teal" />
						Connect SMS
					</h1>
					<p className="text-text-muted">
						Receive text messages for extreme emergencies. Your phone number is end-to-end encrypted
						before entering the blockchain.
					</p>
				</div>

				<Card className="flex flex-col items-center py-12 px-6">
					{step === "phone" && (
						<form onSubmit={handleSendOtp} className="w-full max-w-sm flex flex-col gap-4">
							<div className="text-center mb-2">
								<h3 className="text-lg font-bold mb-1">Enter Phone Number</h3>
								<p className="text-text-muted text-sm">International format required (e.g. +1...)</p>
							</div>

							<div className="flex flex-col gap-2">
								<PhoneInput
									placeholder="Enter a phone number"
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e)}
									international
									defaultCountry="GB"
									className="flex h-11 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 disabled:cursor-not-allowed disabled:opacity-50"
									required
								/>
							</div>

							<Button type="submit" disabled={isSending}>
								{isSending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
								Send Verification Code
							</Button>
						</form>
					)}

					{step === "otp" && (
						<form onSubmit={handleVerifyOtp} className="w-full max-w-sm flex flex-col gap-4">
							<div className="text-center mb-2 flex flex-col items-center">
								<h3 className="text-lg font-bold mb-1">Verify Code</h3>
								<p className="text-text-muted text-sm mb-4">
									We sent a 6-digit code to{" "}
									<span className="font-mono bg-card-2 px-1 py-0.5 rounded text-xs">
										{phone}
									</span>
								</p>
								<Button variant="outline" size="sm" type="button" onClick={() => setStep("phone")}>
									Change Number
								</Button>
							</div>

							<div className="flex flex-col gap-2">
								<input
									ref={otpInputRef}
									type="text"
									inputMode="numeric"
									autoComplete="one-time-code"
									value={otp}
									onChange={(e) => handleOtpChange(e.target.value)}
									onPaste={handleOtpPaste}
									placeholder="000000"
									className="flex h-12 w-full text-center tracking-[0.3em] font-mono text-xl rounded-md border border-border bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/50 disabled:cursor-not-allowed disabled:opacity-50"
									required
									maxLength={6}
								/>
							</div>

							<Button type="submit" disabled={isVerifying || otp.length < 6}>
								{isVerifying ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
								Verify & Continue
							</Button>

							<div className="flex justify-center">
								<Button
									variant="ghost"
									size="sm"
									type="button"
									disabled={resendCooldown > 0 || isSending}
									onClick={() => handleSendOtp()}
									className="text-xs gap-1.5"
								>
									<RefreshCw className="size-3.5" />
									{resendCooldown > 0
										? `Resend code in ${resendCooldown}s`
										: "Resend code"}
								</Button>
							</div>
						</form>
					)}

					{step === "registering" && (
						<div className="flex flex-col items-center">
							<div className="size-16 bg-card-2 text-text-muted rounded-full flex items-center justify-center mb-6">
								<Loader2 className="size-8 animate-spin" />
							</div>
							<h3 className="text-xl font-bold mb-2">Securing on-chain...</h3>
							<p className="text-text-muted text-sm max-w-sm mb-6 text-center">
								Your phone is verified! Please approve the wallet transaction to encrypt and
								securely store it on-chain.
							</p>
						</div>
					)}
				</Card>
			</motion.div>
		</div>
	);
}
