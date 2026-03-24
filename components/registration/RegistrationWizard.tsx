"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { StepIndicator } from "./StepIndicator";
import { StepConnectWallet } from "./StepConnectWallet";
import { StepEnterEmail } from "./StepEnterEmail";
import { StepEncryptSign } from "./StepEncryptSign";
import { StepSuccess } from "./StepSuccess";
import { useRegistration } from "@/hooks/useRegistration";
import type { RegistrationStep } from "@/types";

const STEPS: { key: RegistrationStep; label: string }[] = [
	{ key: "connect", label: "Connect" },
	{ key: "email", label: "Email" },
	{ key: "encrypt", label: "Sign" },
	{ key: "success", label: "Done" },
];

export function RegistrationWizard() {
	const { state, setEmail, setOptIns, setDigestMode, goToStep, register, phase, isRegistering } =
		useRegistration();

	const { connected, disconnect } = useWallet();

	const stepIndex = STEPS.findIndex((s) => s.key === state.step);

	// Only handle disconnection (wallet disconnected externally), not connection
	useEffect(() => {
		if (!connected && state.step !== "connect" && state.step !== "success") {
			goToStep("connect");
		}
	}, [connected, state.step, goToStep]);

	const handleNextStep = () => {
		if (state.step === "connect" && connected) {
			goToStep("email");
		} else if (state.step === "email" && state.email) {
			goToStep("encrypt");
		}
	};

	const handleEmailSubmit = (submittedEmail: string) => {
		setEmail(submittedEmail);
		goToStep("encrypt");
	};

	const handleSignComplete = async () => {
		await register();
	};

	const handleBack = () => {
		if (state.step === "email") {
			// Disconnect wallet when going back to connect step
			disconnect();
			goToStep("connect");
		} else if (state.step === "encrypt") {
			goToStep("email");
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="w-full max-w-130"
		>
			{/* Header */}
			<div className="flex flex-col items-center justify-between mb-3 lg:mb-10 lg:flex lg:flex-row">
				{/* Logo */}
				<div className="flex items-center gap-2 mb-4 lg:mb-0">
					<div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center text-sm font-extrabold text-navy">
						◈
					</div>
					<span className="font-extrabold text-lg tracking-tight">Herald</span>
				</div>

				{/* Step Indicator */}
				<StepIndicator steps={STEPS} currentIndex={stepIndex} />
			</div>

			{state.error && (
				<div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
					{state.error}
				</div>
			)}

			{/* Step Content */}
			<AnimatePresence mode="wait">
				{state.step === "connect" && (
					<motion.div
						key="connect"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
					>
						<StepConnectWallet
							onConnected={() => handleNextStep()}
							onNext={handleNextStep}
							showNextButton={true}
						/>
					</motion.div>
				)}

				{state.step === "email" && (
					<motion.div
						key="email"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
					>
						<StepEnterEmail email={state.email} onBack={handleBack} onSubmit={handleEmailSubmit} />
					</motion.div>
				)}

				{state.step === "encrypt" && (
					<motion.div
						key="encrypt"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
					>
						<StepEncryptSign
							email={state.email}
							prefs={{
								optInDefi: state.optIns.defi,
								optInGovernance: state.optIns.governance,
								optInSystem: state.optIns.system,
								optInMarketing: state.optIns.marketing,
								digestMode: state.digestMode,
							}}
							onPrefsChange={(newPrefs) => {
								setOptIns({
									defi: newPrefs.optInDefi,
									governance: newPrefs.optInGovernance,
									system: newPrefs.optInSystem,
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

				{state.step === "success" && (
					<motion.div
						key="success"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							duration: 0.4,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						<StepSuccess txSignature={state.txSignature || ""} />
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
