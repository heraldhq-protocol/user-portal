"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { DeleteAccountModal } from "@/components/preferences/DeleteAccountModal";
import { EmailUpdateModal } from "@/components/preferences/EmailUpdateModal";
import { RemoveTelegramModal } from "@/components/preferences/RemoveTelegramModal";
import { RemoveSmsModal } from "@/components/preferences/RemoveSmsModal";
import { ChannelStatusCard } from "@/components/preferences/ChannelStatusCard";
import { Mail, MessageCircle, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { PreferencesForm } from "@/components/preferences/PreferencesForm";
import { Button } from "@/components/ui/Button";
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
	const [showRemoveTelegramModal, setShowRemoveTelegramModal] = useState(false);
	const [showRemoveSmsModal, setShowRemoveSmsModal] = useState(false);
	const router = useRouter();

	const loadIdentity = async () => {
		setIsIdentityLoading(true);
		try {
			const data = await fetchApi<IdentityStatus>("/portal/identity");
			setStatus(data);
		} catch (err) {
			console.error("Failed to load identity:", err);
		} finally {
			setIsIdentityLoading(false);
		}
	};

	useEffect(() => {
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

					{/* Notification Channels */}
					<div className="mb-8">
						<h3 className="text-[13px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-widest mb-4">
							Notification channels
						</h3>

						<ChannelStatusCard
							title="Email Address"
							icon={Mail}
							status={status?.channels?.email ? "connected" : "disconnected"}
							description={
								status?.channels?.email ? "Encrypted data hidden" : "Required for digest delivery"
							}
							actionText={status?.channels?.email ? "Update" : "Connect"}
							onAction={() => setShowEmailModal(true)}
						/>

						<ChannelStatusCard
							title="Telegram"
							icon={MessageCircle}
							status={status?.channels?.telegram ? "connected" : "disconnected"}
							description="Get ultra-fast alerts directly in Telegram"
							actionText={status?.channels?.telegram ? "Remove" : "Connect"}
							actionVariant={status?.channels?.telegram ? "secondary" : "primary"}
							onAction={() =>
								status?.channels?.telegram
									? setShowRemoveTelegramModal(true)
									: router.push("/preferences/telegram")
							}
						/>

						<ChannelStatusCard
							title="SMS / Text Messages"
							icon={Smartphone}
							status={status?.channels?.sms ? "connected" : "disconnected"}
							description="For critical liquidation or security alerts"
							actionText={status?.channels?.sms ? "Remove" : "Connect"}
							actionVariant={status?.channels?.sms ? "secondary" : "primary"}
							onAction={() =>
								status?.channels?.sms
									? setShowRemoveSmsModal(true)
									: router.push("/preferences/sms")
							}
							comingSoon={!status?.channels?.sms}
						/>
					</div>
					{/* Danger zone */}
					<div className="border-t border-border pt-6">
						<div className="text-[11px] font-bold text-text-muted tracking-[2px] uppercase mb-3">
							Danger zone
						</div>
						<Button
							variant={"danger"}
							className="bg-red-200 bg-opacity-10 text-red-700 border border-red border-opacity-20 hover:bg-opacity-20"
							onClick={() => setShowDeleteModal(true)}
						>
							Delete account
						</Button>
					</div>

					<EmailUpdateModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} />
					<RemoveTelegramModal
						isOpen={showRemoveTelegramModal}
						onClose={() => setShowRemoveTelegramModal(false)}
						onSuccess={loadIdentity}
					/>
					<RemoveSmsModal
						isOpen={showRemoveSmsModal}
						onClose={() => setShowRemoveSmsModal(false)}
						onSuccess={loadIdentity}
					/>
					<DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
				</motion.div>
			)}
		</div>
	);
}
