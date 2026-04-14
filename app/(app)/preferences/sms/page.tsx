/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, ArrowLeft, Smartphone } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { ChannelUserClient, type SolanaCluster } from "@herald-protocol/sdk";
import { PhoneInput } from "@/components/ui/phone-input";

export default function SmsSetupPage() {
	const { publicKey, signTransaction } = useWallet();
	const { connection } = useConnection();
	const router = useRouter();

	const [phone, setPhone] = useState("+1");
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState<"phone" | "otp" | "registering">("phone");
	const [isSending, setIsSending] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!phoneRegex.test(phone)) {
			toast.error("Please enter a valid international phone number (e.g., +1234567890)");
			return;
		}

		setIsSending(true);
		try {
			// Expected endpoint on Admin API
			await fetchApi("/portal/channels/sms/send-otp", {
				method: "POST",
				body: JSON.stringify({ phone }),
			});
			setStep("otp");
			toast.success("Verification code sent via SMS");
		} catch (err: any) {
			toast.error(err.message || "Failed to send code");
		} finally {
			setIsSending(false);
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
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
			setIsVerifying(false); // Let them try again
		}
	};

	const registerOnChain = async () => {
		if (!publicKey || !signTransaction) {
			toast.error("Wallet not connected");
			return;
		}

		setStep("registering");
		try {
			const client = new ChannelUserClient({
				cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as SolanaCluster) || "devnet",
				rpcUrl: connection.rpcEndpoint,
			});

			const { instructions } = await client.buildSmsRegistrationTx(publicKey, phone);

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

			await fetchApi("/portal/identity", { method: "POST" });
			toast.success("Phone number verified and registered on-chain!");
			router.push("/preferences");
		} catch (err: any) {
			console.error(err);
			toast.error(err.message || "Failed to register phone on-chain");
			setStep("otp"); // Allow retry on chain failure but keep OTP session
		}
	};

	const phoneRegex = /^\+[1-9]\d{1,14}$/;

	return (
		<div className="max-w-160 mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
				<div className="mb-8">
					<h1 className="text-[28px] font-extrabold tracking-tight mb-2 flex items-center gap-2">
						<Smartphone className="h-8 w-8 text-teal-500" />
						Connect SMS
					</h1>
					<p className="text-slate-500">
						Receive text messages for extreme emergencies. Your phone number is end-to-end encrypted
						before entering the blockchain.
					</p>
				</div>

				<Card className="flex flex-col items-center py-12 px-6">
					{step === "phone" && (
						<form onSubmit={handleSendOtp} className="w-full max-w-sm flex flex-col gap-4">
							<div className="text-center mb-2">
								<h3 className="text-lg font-bold mb-1">Enter Phone Number</h3>
								<p className="text-slate-500 text-sm">International format required (e.g. +1...)</p>
							</div>

							<div className="flex flex-col gap-2">
								<PhoneInput
									placeholder="Enter a phone number"
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e)}
									international
									defaultCountry="GB"
									className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-300"
									required
								/>
							</div>

							<Button type="submit" disabled={isSending}>
								{isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
								Send Verification Code
							</Button>
						</form>
					)}

					{step === "otp" && (
						<form onSubmit={handleVerifyOtp} className="w-full max-w-sm flex flex-col gap-4">
							<div className="text-center mb-2 flex flex-col items-center">
								<h3 className="text-lg font-bold mb-1">Verify Code</h3>
								<p className="text-slate-500 text-sm mb-4">
									We sent a 6-digit code to{" "}
									<span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">
										{phone}
									</span>
								</p>
								<Button variant="outline" size="sm" type="button" onClick={() => setStep("phone")}>
									Change Number
								</Button>
							</div>

							<div className="flex flex-col gap-2">
								<input
									type="text"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									placeholder="000000"
									className="flex h-11 w-full text-center tracking-widest font-mono text-lg rounded-md border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-300"
									required
									maxLength={6}
								/>
							</div>

							<Button type="submit" disabled={isVerifying || otp.length < 6}>
								{isVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
								Verify & Continue
							</Button>
						</form>
					)}

					{step === "registering" && (
						<div className="flex flex-col items-center">
							<div className="h-16 w-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-6">
								<Loader2 className="h-8 w-8 animate-spin" />
							</div>
							<h3 className="text-xl font-bold mb-2">Securing on-chain...</h3>
							<p className="text-slate-500 text-sm max-w-sm mb-6 text-center">
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
