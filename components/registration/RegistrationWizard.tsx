"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StepIndicator } from "./StepIndicator";
import { StepConnectWallet } from "./StepConnectWallet";
import { StepEnterEmail } from "./StepEnterEmail";
import { StepEncryptSign } from "./StepEncryptSign";
import { StepSuccess } from "./StepSuccess";
import type { RegistrationStep } from "@/types";

const STEPS: { key: RegistrationStep; label: string }[] = [
  { key: "connect", label: "Connect" },
  { key: "email", label: "Email" },
  { key: "encrypt", label: "Sign" },
  { key: "success", label: "Done" },
];

export function RegistrationWizard() {
  const [step, setStep] = useState<RegistrationStep>("connect");
  const [email, setEmail] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [prefs, setPrefs] = useState({
    optInDefi: true,
    optInGovernance: true,
    optInSystem: true,
    optInMarketing: false,
    digestMode: false,
  });

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    setStep("email");
  };

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("encrypt");
  };

  const handleSignComplete = (sig: string) => {
    setTxSignature(sig);
    setStep("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[520px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center text-sm font-extrabold text-navy">
            ◈
          </div>
          <span className="font-extrabold text-lg tracking-tight">Herald</span>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentIndex={stepIndex} />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === "connect" && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepConnectWallet onConnected={handleWalletConnected} />
          </motion.div>
        )}

        {step === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepEnterEmail
              email={email}
              onBack={() => setStep("connect")}
              onSubmit={handleEmailSubmit}
            />
          </motion.div>
        )}

        {step === "encrypt" && (
          <motion.div
            key="encrypt"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepEncryptSign
              email={email}
              prefs={prefs}
              onPrefsChange={setPrefs}
              onBack={() => setStep("email")}
              onComplete={handleSignComplete}
            />
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <StepSuccess txSignature={txSignature} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
