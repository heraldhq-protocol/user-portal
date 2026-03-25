"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { useState } from "react";
import { DeleteAccountModal } from "@/components/preferences/DeleteAccountModal";
import { EmailUpdateModal } from "@/components/preferences/EmailUpdateModal";
import { PreferencesForm } from "@/components/preferences/PreferencesForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useWalletRegistrationStatus } from "@/hooks/useWalletRegistrationStatus";
import { truncateAddress } from "@/lib/utils";

export default function PreferencesPage() {
	const { publicKey } = useWallet();
	const { data: status, isLoading } = useWalletRegistrationStatus();

	const [showEmailModal, setShowEmailModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Fallback defaults until dynamic decoding is added
	const initialPrefs = {
		optInDefi: true,
		optInGovernance: true,
		optInSystem: true,
		optInMarketing: false,
		digestMode: false,
	};

	return (
		<div className="max-w-[640px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
			{isLoading ? (
				<div className="text-center text-text-muted py-12">Loading preferences...</div>
			) : !status?.registered ? (
				<div className="text-center text-text-muted py-12">
					No Herald identity found for this wallet. Please register first.
				</div>
			) : (
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<div className="mb-9">
						<h1 className="text-[28px] font-extrabold tracking-tight mb-1.5">Preferences</h1>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-teal" />
							<span className="font-mono text-[13px] text-text-muted">
								{publicKey ? truncateAddress(publicKey.toBase58(), 4) : "Unknown"}
							</span>
						</div>
					</div>

					{/* Categories & Delivery Mode Form */}
					<PreferencesForm initialValues={initialPrefs} />

					{/* Email */}
					<Card className="mb-6">
						<h3 className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-3.5">
							Email address
						</h3>
						<div className="flex items-center justify-between">
							<span className="text-sm text-text-secondary blur-sm selection:blur-none transition-all hover:blur-none">
								encrypted_data_hidden
							</span>
							<Button variant="secondary" size="sm" onClick={() => setShowEmailModal(true)}>
								Update email
							</Button>
						</div>
					</Card>

					{/* Danger zone */}
					<div className="border-t border-border pt-6">
						<div className="text-[11px] font-bold text-text-muted tracking-[2px] uppercase mb-3">
							Danger zone
						</div>
						<Button
							className="bg-red bg-opacity-10 text-red border border-red border-opacity-20 hover:bg-opacity-20"
							onClick={() => setShowDeleteModal(true)}
						>
							Delete account
						</Button>
					</div>

					<EmailUpdateModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} />
					<DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
				</motion.div>
			)}
		</div>
	);
}
