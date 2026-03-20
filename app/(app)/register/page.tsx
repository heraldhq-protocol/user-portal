import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — Herald",
  description: "Register your email for privacy-preserving DeFi notifications on Solana.",
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-16">
      <RegistrationWizard />
    </div>
  );
}
