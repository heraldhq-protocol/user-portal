"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { DeleteAccountModal } from "@/components/preferences/DeleteAccountModal";
import { EmailUpdateModal } from "@/components/preferences/EmailUpdateModal";
import { PreferencesForm } from "@/components/preferences/PreferencesForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { truncateAddress } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { type IdentityStatus } from "@/types";
import { useWalletRegistrationStatus } from "@/hooks/useWalletRegistrationStatus";

export default function PreferencesPage() {
	const { publicKey } = useWallet();
	const [status, setStatus] = useState<IdentityStatus | null>(null);
	const [isIdentityLoading, setIsIdentityLoading] = useState(true);
	const { data: registerStatus, isLoading: isRegisterLoading } = useWalletRegistrationStatus();

	const [showEmailModal, setShowEmailModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	useEffect(() => {
		async function loadIdentity() {
			try {
				const data = await fetchApi<IdentityStatus>("/portal/identity");
				setStatus(data);
			} catch (err) {
				console.error("Failed to load identity:", err);
			} finally {
				setIsIdentityLoading(false);
			}
		}

		if (publicKey) {
			loadIdentity();
		} else {
			setIsIdentityLoading(false);
		}
	}, [publicKey]);

	const isLoading = isIdentityLoading || isRegisterLoading;

	// Fallback defaults or actual preferences
	const initialPrefs = status?.optIns
		? {
				optInAll: status.optIns.all,
				optInDefi: status.optIns.defi,
				optInGovernance: status.optIns.governance,
				optInMarketing: status.optIns.marketing,
				digestMode: status.digestMode,
			}
		: {
				optInAll: true,
				optInDefi: true,
				optInGovernance: true,
				optInMarketing: false,
				digestMode: false,
			};

	return (
		<div className="max-w-160 mx-auto px-4 sm:px-6 py-8 sm:py-12">
			{isLoading ? (
				<Loader message="Loading preferences..." />
			) : !registerStatus?.registered ? (
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
