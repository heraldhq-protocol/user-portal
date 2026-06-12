"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Modal, ModalTitle } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { emailUpdateSchema, type EmailUpdateFormData } from "@/lib/schemas";
import { encryptEmail } from "@/lib/crypto";
import { Transaction } from "@solana/web3.js";
import { fetchApi } from "@/lib/api";
import { useSolBalance } from "@/hooks/useSolBalance";
import { cn } from "@/lib/utils";
import { saveOtpSession, getValidOtpSession } from "@/lib/otpSession";

type Step = "email" | "otp" | "sign";

interface EmailUpdateModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function EmailUpdateModal({ isOpen, onClose }: EmailUpdateModalProps) {
	const walletContext = useWallet();
	const { connection } = useConnection();
	const { checkAndAirdrop } = useSolBalance();

	const [step, setStep] = useState<Step>("email");
	const [pendingEmail, setPendingEmail] = useState("");
	const [maskedEmail, setMaskedEmail] = useState("");
	const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
	const [otpError, setOtpError] = useState<string | null>(null);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const [cooldown, setCooldown] = useState(0);
	const [otpAlreadySent, setOtpAlreadySent] = useState(false);
	const [otpMinutesRemaining, setOtpMinutesRemaining] = useState<number | undefined>();
	const [isSending, setIsSending] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [isEncrypting, setIsEncrypting] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<EmailUpdateFormData>({
		resolver: zodResolver(emailUpdateSchema),
	});

	useEffect(() => {
		if (cooldown <= 0) return;
		const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(t);
	}, [cooldown]);

	const handleClose = () => {
		reset();
		setStep("email");
		setPendingEmail("");
		setMaskedEmail("");
		setDigits(["", "", "", "", "", ""]);
		setOtpError(null);
		setOtpAlreadySent(false);
		setOtpMinutesRemaining(undefined);
		onClose();
	};

	const handleDigitChange = (index: number, value: string) => {
		const cleanValue = value.replace(/\D/g, "");

		if (cleanValue.length > 1) {
			const next = [...digits];
			for (let i = 0; i < cleanValue.length && index + i < 6; i++) {
				next[index + i] = cleanValue[i];
			}
			setDigits(next);
			setOtpError(null);

			const lastFilledIndex = Math.min(index + cleanValue.length - 1, 5);
			inputRefs.current[lastFilledIndex]?.focus();

			const code = next.join("");
			if (code.length === 6) {
				triggerVerify(code);
			}
			return;
		}

		const digit = cleanValue.slice(-1);
		const next = [...digits];
		next[index] = digit;
		setDigits(next);
		setOtpError(null);
		if (digit && index < 5) inputRefs.current[index + 1]?.focus();
		if (digit && index === 5) {
			const code = next.join("");
			if (code.length === 6) triggerVerify(code);
		}
	};

	const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace") {
			if (digits[index]) {
				const next = [...digits];
				next[index] = "";
				setDigits(next);
			} else if (index > 0) {
				inputRefs.current[index - 1]?.focus();
			}
		} else if (e.key === "ArrowLeft" && index > 0) {
			inputRefs.current[index - 1]?.focus();
		} else if (e.key === "ArrowRight" && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
		if (!pasted) return;
		const next = Array(6).fill("").map((_, i) => pasted[i] ?? "");
		setDigits(next);
		setOtpError(null);
		const lastFilled = Math.min(pasted.length - 1, 5);
		inputRefs.current[lastFilled]?.focus();
		if (pasted.length === 6) triggerVerify(pasted);
	};

	// Step 1 → 2: send OTP, or skip to signing if already verified recently
	const onEmailSubmit = async (data: EmailUpdateFormData) => {
		if (!walletContext.publicKey) return;
		const walletPubkey = walletContext.publicKey.toBase58();

		// Skip OTP entirely if this email was verified in this session
		const cached = getValidOtpSession(data.newEmail, walletPubkey);
		if (cached) {
			setPendingEmail(data.newEmail);
			await runOnChainUpdate(data.newEmail);
			return;
		}

		try {
			setIsSending(true);
			const result = await fetchApi<{ maskedEmail: string; alreadySent: boolean; minutesRemaining?: number }>("/auth/email/otp/send", {
				method: "POST",
				body: JSON.stringify({ email: data.newEmail, walletPubkey }),
			});
			setPendingEmail(data.newEmail);
			setMaskedEmail(result.maskedEmail);
			setOtpAlreadySent(result.alreadySent);
			setOtpMinutesRemaining(result.minutesRemaining);
			// Only start 60s resend cooldown for a freshly sent OTP; if reusing an existing
			// one the user can resend immediately.
			if (!result.alreadySent) setCooldown(60);
			setStep("otp");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "";
			const isAlreadySent = msg.toLowerCase().includes("sent") || msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many");
			if (isAlreadySent) {
				setPendingEmail(data.newEmail);
				setMaskedEmail(data.newEmail.replace(/^(.)(.*)(@.*)$/, (_, f, m, e) => f + "*".repeat(m.length) + e));
				setOtpAlreadySent(true);
				setOtpMinutesRemaining(undefined);
				setCooldown(0);
				setStep("otp");
			} else {
				toast.error((err as { message?: string }).message || "Failed to send verification code");
			}
		} finally {
			setIsSending(false);
		}
	};

	// Resend OTP — always force a fresh code
	const handleResend = async () => {
		if (!walletContext.publicKey || !pendingEmail || cooldown > 0 || isSending) return;
		try {
			setIsSending(true);
			setDigits(["", "", "", "", "", ""]);
			setOtpError(null);
			const result = await fetchApi<{ maskedEmail: string; alreadySent: boolean }>("/auth/email/otp/send", {
				method: "POST",
				body: JSON.stringify({
					email: pendingEmail,
					walletPubkey: walletContext.publicKey.toBase58(),
					force: true,
				}),
			});
			setMaskedEmail(result.maskedEmail);
			setOtpAlreadySent(false);
			setOtpMinutesRemaining(undefined);
			setCooldown(60);
			inputRefs.current[0]?.focus();
		} catch (err: unknown) {
			toast.error((err as { message?: string }).message || "Failed to resend code");
		} finally {
			setIsSending(false);
		}
	};

	// On-chain email update (runs after OTP verified or cache hit)
	const runOnChainUpdate = async (email: string) => {
		if (!walletContext.publicKey || !walletContext.signTransaction) return;
		try {
			setIsSubmitting(true);
			await checkAndAirdrop(0.01);

			setIsEncrypting(true);
			const { encryptedEmail, nonce } = await encryptEmail(email, walletContext.publicKey);
			setIsEncrypting(false);

			const encryptedEmailBase64 = Buffer.from(encryptedEmail).toString("base64");
			const nonceBase64 = Buffer.from(nonce).toString("base64");

			const { serializedTransaction } = await fetchApi<{ serializedTransaction: string }>(
				"/portal/email/transaction",
				{
					method: "POST",
					body: JSON.stringify({ newEmail: email, encryptedEmail: encryptedEmailBase64, nonce: nonceBase64 }),
				},
			);

			const sendAndConfirmWithRetry = async (attempt = 1): Promise<void> => {
				const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
				const tx = Transaction.from(Buffer.from(serializedTransaction, "base64"));
				tx.recentBlockhash = blockhash;
				const signedTx = await walletContext.signTransaction!(tx);
				const signature = await connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true, maxRetries: 3 });
				try {
					await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
				} catch (err: unknown) {
					const isExpired = err instanceof Error && err.name === "TransactionExpiredBlockheightExceededError";
					if (isExpired && attempt < 3) {
						toast.info(`Network slow — retrying (${attempt}/3)...`);
						return sendAndConfirmWithRetry(attempt + 1);
					}
					throw err;
				}
			};
			await sendAndConfirmWithRetry();

			await fetchApi("/portal/email", { method: "PATCH", body: JSON.stringify({ email }) });
			toast.success("Email updated successfully");
			handleClose();
		} catch (err: unknown) {
			console.error("Update email error:", err);
			toast.error((err as { message?: string }).message || "Failed to update email");
		} finally {
			setIsSubmitting(false);
			setIsEncrypting(false);
		}
	};

	// Step 2: verify OTP then proceed to on-chain update
	const triggerVerify = async (code: string) => {
		if (!walletContext.publicKey) return;
		try {
			setIsVerifying(true);
			const verifyResult = await fetchApi<{ verified: boolean; emailVerifiedToken?: string; error?: string }>(
				"/auth/email/otp/verify",
				{
					method: "POST",
					body: JSON.stringify({ email: pendingEmail, code, walletPubkey: walletContext.publicKey.toBase58() }),
				},
			);

			if (!verifyResult.verified) {
				setOtpError(verifyResult.error || "Incorrect code — please try again");
				setDigits(["", "", "", "", "", ""]);
				inputRefs.current[0]?.focus();
				setIsVerifying(false);
				return;
			}

			if (verifyResult.emailVerifiedToken) {
				saveOtpSession(pendingEmail, walletContext.publicKey.toBase58(), verifyResult.emailVerifiedToken);
			}

			setIsVerifying(false);
			await runOnChainUpdate(pendingEmail);
		} catch (err: unknown) {
			console.error("Verify OTP error:", err);
			toast.error((err as { message?: string }).message || "Verification failed");
		} finally {
			setIsVerifying(false);
		}
	};

	const signingLabel = isEncrypting ? "Encrypting…" : isSubmitting ? "Signing…" : "Confirm update";

	return (
		<Modal open={isOpen} onOpenChange={(val) => !val && handleClose()}>
			<ModalTitle className="text-xl font-extrabold mb-1">Update Email Address</ModalTitle>

			{/* Step indicators */}
			<div className="flex items-center gap-2 mb-6 mt-2">
				{(["email", "otp", "sign"] as Step[]).map((s, i) => (
					<div key={s} className="flex items-center gap-2">
						<div className={cn(
							"w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
							step === s
								? "bg-teal border-teal text-navy"
								: (["email", "otp", "sign"].indexOf(step) > i)
									? "bg-teal/20 border-teal/40 text-teal"
									: "bg-transparent border-border text-text-muted"
						)}>
							{i + 1}
						</div>
						<span className={cn(
							"text-[11px] font-semibold",
							step === s ? "text-text-primary" : "text-text-muted"
						)}>
							{s === "email" ? "New email" : s === "otp" ? "Verify" : "Confirm"}
						</span>
						{i < 2 && <div className="w-6 h-px bg-border" />}
					</div>
				))}
			</div>

			{/* Step 1: Email + confirm */}
			{step === "email" && (
				<form onSubmit={handleSubmit(onEmailSubmit)} className="flex flex-col gap-4">
					<div>
						<label className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">
							New Email
						</label>
						<Input {...register("newEmail")} placeholder="alice@example.com" />
						{errors.newEmail?.message && (
							<span className="text-red-400 text-xs mt-1 block">{errors.newEmail.message}</span>
						)}
					</div>
					<div>
						<label className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">
							Confirm Email
						</label>
						<Input {...register("confirmEmail")} placeholder="alice@example.com" />
						{errors.confirmEmail?.message && (
							<span className="text-red-400 text-xs mt-1 block">{errors.confirmEmail.message}</span>
						)}
					</div>
					<div className="flex gap-3 mt-2">
						<Button variant="secondary" className="shrink-0 justify-center" onClick={handleClose} type="button">
							Cancel
						</Button>
						<Button className="flex-1 justify-center whitespace-nowrap" type="submit" disabled={isSending}>
							{isSending ? "Sending…" : "Send code"}
						</Button>
					</div>
				</form>
			)}

			{/* Step 2: OTP */}
			{step === "otp" && (
				<div className="flex flex-col gap-4">
					{otpAlreadySent ? (
						<div className="bg-teal/10 border border-teal/20 rounded-xl px-4 py-3 text-xs text-teal text-center">
							A code was already sent to{" "}
							<span className="font-semibold">{maskedEmail}</span>{otpMinutesRemaining != null ? ` — expires in ${otpMinutesRemaining} min` : ''}. Enter it below, or click &ldquo;Resend code&rdquo; for a fresh one.
						</div>
					) : (
						<p className="text-sm text-text-muted">
							A 6-digit code was sent to{" "}
							<span className="font-semibold text-text-primary">{maskedEmail}</span>.
						</p>
					)}

					{/* Pin boxes */}
					<div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
						{digits.map((digit, i) => (
							<input
								key={i}
								ref={(el) => { inputRefs.current[i] = el; }}
								type="text"
								inputMode="numeric"
								maxLength={6}
								value={digit}
								onChange={(e) => handleDigitChange(i, e.target.value)}
								onKeyDown={(e) => handleDigitKeyDown(i, e)}
								autoFocus={i === 0}
								className={cn(
									"w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 bg-navy-2 text-text-primary caret-transparent select-none",
									otpError
										? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
										: digit
											? "border-teal focus:border-teal focus:ring-teal/30"
											: "border-border-2 focus:border-teal/60 focus:ring-teal/20"
								)}
								aria-label={`Digit ${i + 1}`}
							/>
						))}
					</div>

					{otpError && (
						<p className="text-xs text-red-400 text-center -mt-2">
							{otpError}
						</p>
					)}

					<div className="flex items-center justify-between text-xs">
						<button
							onClick={() => setStep("email")}
							className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
						>
							← Change email
						</button>
						{cooldown > 0 ? (
							<span className="text-text-muted">Resend in {cooldown}s</span>
						) : (
							<button
								onClick={handleResend}
								disabled={isSending}
								className="text-teal hover:text-teal/80 font-semibold transition-colors cursor-pointer disabled:opacity-50"
							>
								{isSending ? "Sending…" : "Resend code"}
							</button>
						)}
					</div>

					<div className="flex gap-3">
						<Button variant="secondary" className="shrink-0" onClick={handleClose} type="button">
							Cancel
						</Button>
						<Button
							className="flex-1 whitespace-nowrap"
							onClick={() => triggerVerify(digits.join(""))}
							disabled={!digits.every((d) => d !== "") || isVerifying || isSubmitting}
						>
							{isVerifying ? "Verifying…" : signingLabel}
						</Button>
					</div>
				</div>
			)}
		</Modal>
	);
}
