"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { StepIndicator } from "./StepIndicator";
import { StepConnectWallet } from "./StepConnectWallet";
import { StepEnterEmail } from "./StepEnterEmail";
import { StepVerifyEmail } from "./StepVerifyEmail";
import { StepEncryptSign } from "./StepEncryptSign";
import { StepSuccess } from "./StepSuccess";
import { StepLogin } from "./StepLogin";
import { useRegistration } from "@/hooks/useRegistration";
import { fetchApi } from "@/lib/api";
import type { RegistrationStep } from "@/types";
import Image from "next/image";

const STEPS_NEW: { key: RegistrationStep; label: string }[] = [
	{ key: "connect", label: "Connect" },
	{ key: "email", label: "Email" },
	{ key: "verify-email", label: "Verify" },
	{ key: "encrypt", label: "Sign" },
	{ key: "success", label: "Done" },
];

const STEPS_REGISTERED: { key: RegistrationStep; label: string }[] = [
	{ key: "connect", label: "Connect" },
	{ key: "login", label: "Sign In" },
	{ key: "success", label: "Done" },
];

interface ProtocolContext {
	name?: string;
	logoUrl?: string | null;
	protocolId?: string;
}

export function RegistrationWizard({ protocolContext }: { protocolContext?: ProtocolContext } = {}) {
	const {
		state,
		setEmail,
		setMaskedEmail,
		setEmailVerifiedToken,
		setOptIns,
		setDigestMode,
		goToStep,
		register,
		phase,
		isRegistering,
		isRegistered,
		isCheckingStatus,
	} = useRegistration();

	const { connected, disconnect, publicKey } = useWallet();

	// Smoothly transition to login step if already registered
	useEffect(() => {
		if (connected && isRegistered && !isCheckingStatus && state.step === "connect") {
			// Delay slightly for visual comfort
			const timer = setTimeout(() => goToStep("login"), 600);
			return () => clearTimeout(timer);
		}
	}, [connected, isRegistered, isCheckingStatus, state.step, goToStep]);

	const steps = isRegistered ? STEPS_REGISTERED : STEPS_NEW;
	const stepIndex = steps.findIndex((s) => s.key === state.step);

	// Only handle disconnection (wallet disconnected externally), not connection
	useEffect(() => {
		if (!connected && state.step !== "connect" && state.step !== "success") {
			goToStep("connect");
		}
	}, [connected, state.step, goToStep]);

	const handleNextStep = () => {
		if (state.step === "connect" && connected) {
			// If already on-chain, the useEffect in useRegistration will handle the redirect;
			// but also guard here in case the effect hasn't fired yet.
			if (isRegistered) {
				goToStep("login");
				return;
			}
			goToStep("email");
		} else if (state.step === "email" && state.email) {
			// Handled by handleEmailSubmit (sends OTP first)
		}
	};

	const handleEmailSubmit = async (submittedEmail: string) => {
		setEmail(submittedEmail);
		try {
			const res = await fetchApi<{ maskedEmail: string }>('/auth/email/otp/send', {
				method: 'POST',
				body: JSON.stringify({ email: submittedEmail, walletPubkey: publicKey?.toBase58() ?? '' }),
			});
			setMaskedEmail(res.maskedEmail);
			goToStep('verify-email');
		} catch {
			// Surface error in StepEnterEmail — for now fall through to encrypt as fallback
			goToStep('verify-email');
		}
	};

	const handleVerifyEmail = (token: string) => {
		setEmailVerifiedToken(token);
		goToStep('encrypt');
	};

	const handleSignComplete = async () => {
		await register();
		if (protocolContext?.protocolId) {
			fetchApi(`/portal/protocols/${protocolContext.protocolId}/subscribe`, { method: "POST" }).catch(() => {});
		}
	};

	const handleBack = () => {
		if (state.step === "email") {
			// Disconnect wallet when going back to connect step
			disconnect();
			goToStep("connect");
		} else if (state.step === "verify-email") {
			goToStep("email");
		} else if (state.step === "encrypt") {
			goToStep("verify-email");
		} else if (state.step === "login") {
			disconnect();
			goToStep("connect");
		}
	};

	const handleLoginComplete = () => {
		if (protocolContext?.protocolId) {
			fetchApi(`/portal/protocols/${protocolContext.protocolId}/subscribe`, { method: "POST" }).catch(() => {});
		}
		goToStep("success");
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="w-full max-w-130"
		>
			{/* Header */}
			<div className="flex flex-col items-center gap-5 mb-8">
				{/* Protocol × Herald branding — centered, always its own row */}
				<div className="flex items-center gap-3">
					{protocolContext?.logoUrl ? (
						<>
							<img src={protocolContext.logoUrl} alt={protocolContext.name ?? "Protocol"} width={32} height={32} className="rounded-lg object-contain" />
							<span className="font-extrabold text-lg tracking-tight">{protocolContext.name}</span>
							<span className="text-text-muted text-base font-bold px-1">×</span>
							<Image src="/logo_icon.svg" alt="Herald" width={28} height={28} />
							<span className="font-extrabold text-lg tracking-tight">Herald</span>
						</>
					) : (
						<>
							<Image src="/logo_icon.svg" alt="Herald Logo" width={32} height={32} />
							<span className="font-extrabold text-lg tracking-tight">
								{protocolContext?.name ? `${protocolContext.name} × Herald` : "Herald"}
							</span>
						</>
					)}
				</div>

				{/* Step Indicator — its own row below branding */}
				<StepIndicator steps={steps} currentIndex={stepIndex} />
			</div>

			{state.error && (
				<div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
					{state.error}
				</div>
			)}

			{/* Step Content */}
			<AnimatePresence mode="popLayout">
				{state.step === "connect" && (
					<motion.div
						key="connect"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						layout
					>
						{protocolContext?.name && (
							<div className="mb-5 px-4 py-3 bg-teal/5 border border-teal/20 rounded-xl text-center">
								<p className="text-xs text-text-muted">
									Enable notifications from{" "}
									<span className="font-semibold text-teal">{protocolContext.name}</span>
									{" "}— your email stays private, always.
								</p>
							</div>
						)}
						{isCheckingStatus && connected ? (
							<div className="flex flex-col items-center justify-center py-12 gap-4">
								<div className="w-10 h-10 border-2 border-teal border-t-transparent rounded-full animate-spin" />
								<p className="text-sm font-bold text-text-muted">Checking registration...</p>
							</div>
						) : (
							<StepConnectWallet
								onConnected={() => handleNextStep()}
								onNext={handleNextStep}
								showNextButton={true}
							/>
						)}
					</motion.div>
				)}

				{state.step === "email" && (
					<motion.div
						key="email"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						layout
					>
						<StepEnterEmail email={state.email} onBack={handleBack} onSubmit={handleEmailSubmit} />
					</motion.div>
				)}

				{state.step === "verify-email" && (
					<motion.div
						key="verify-email"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						layout
					>
						<StepVerifyEmail
							email={state.email}
							maskedEmail={state.maskedEmail}
							walletPubkey={publicKey?.toBase58() ?? ''}
							onBack={handleBack}
							onVerified={handleVerifyEmail}
						/>
					</motion.div>
				)}

				{state.step === "encrypt" && (
					<motion.div
						key="encrypt"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						layout
					>
						<StepEncryptSign
							email={state.email}
							prefs={{
								optInAll: state.optIns.optInAll,
								optInDefi: state.optIns.defi,
								optInGovernance: state.optIns.governance,
								optInMarketing: state.optIns.marketing,
								digestMode: state.digestMode,
							}}
							onPrefsChange={(newPrefs) => {
								setOptIns({
									optInAll: newPrefs.optInAll,
									defi: newPrefs.optInDefi,
									governance: newPrefs.optInGovernance,
									marketing: newPrefs.optInMarketing,
								});
								setDigestMode(newPrefs.digestMode);
							}}
							onBack={handleBack}
							onComplete={handleSignComplete}
							encryptPhase={phase}
							isRegistering={isRegistering}
						/>
					</motion.div>
				)}

				{state.step === "login" && (
					<motion.div
						key="login"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						layout
					>
						<StepLogin onBack={handleBack} onComplete={handleLoginComplete} />
					</motion.div>
				)}

				{state.step === "success" && (
					<motion.div
						key="success"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{
							duration: 0.35,
							ease: [0.22, 1, 0.36, 1],
						}}
						layout
					>
						<StepSuccess
							txSignature={state.txSignature || ""}
							isAlreadyRegistered={isRegistered}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
