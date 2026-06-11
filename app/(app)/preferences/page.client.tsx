"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { DeleteAccountModal } from "@/components/preferences/DeleteAccountModal";
import { EmailUpdateModal } from "@/components/preferences/EmailUpdateModal";
import { RemoveTelegramModal } from "@/components/preferences/RemoveTelegramModal";
import { RemoveSmsModal } from "@/components/preferences/RemoveSmsModal";
import { ChannelStatusCard } from "@/components/preferences/ChannelStatusCard";
import { NotificationKeyCard } from "@/components/preferences/NotificationKeyCard";
import { Mail, MessageCircle, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { PreferencesForm } from "@/components/preferences/PreferencesForm";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { truncateAddress } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { type IdentityStatus } from "@/types";
import { useWalletRegistrationStatus } from "@/hooks/useWalletRegistrationStatus";
import { useOrynthHolder } from "@/hooks/useOrynthHolder";

export default function PreferencesPage() {
	const { publicKey } = useWallet();
	const [status, setStatus] = useState<IdentityStatus | null>(null);
	const [isIdentityLoading, setIsIdentityLoading] = useState(true);
	const { data: registerStatus, isLoading: isRegisterLoading } = useWalletRegistrationStatus();
	const { data: isEarlyBeliever } = useOrynthHolder();

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
			// eslint-disable-next-line react-hooks/set-state-in-effect
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
					<div className="mb-6 sm:mb-9">
						<h1 className="text-xl sm:text-[28px] font-extrabold tracking-tight mb-1.5">Preferences</h1>
						<div className="flex items-center gap-2 flex-wrap">
							<div className="w-2 h-2 rounded-full bg-teal shrink-0" />
							<span className="font-mono text-[12px] sm:text-[13px] text-text-muted truncate">
								{publicKey ? truncateAddress(publicKey.toBase58(), 4) : "Unknown"}
							</span>
							{isEarlyBeliever && (
								<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal/10 border border-teal/25 text-teal text-[10px] font-bold uppercase tracking-wide">
									✦ Early Believer
								</span>
							)}
						</div>
					</div>

					{/* Early Believer CTA — shown only to confirmed non-holders */}
					{isEarlyBeliever === false && (
						<a
							href="https://orynth.dev/projects/herald-protocol"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl bg-teal/5 border border-teal/20 hover:border-teal/40 transition-colors duration-200 group"
						>
							<div>
								<p className="text-xs font-bold text-teal uppercase tracking-wide mb-0.5">
									✦ Early Believer
								</p>
								<p className="text-xs text-text-muted">
									Hold the Herald coin on Orynth to unlock priority delivery and your Early Believer badge.
								</p>
							</div>
							<span className="text-teal text-sm shrink-0 group-hover:translate-x-0.5 transition-transform">
								→
							</span>
						</a>
					)}

					{/* Categories & Delivery Mode Form */}
					<PreferencesForm initialValues={initialPrefs} isEarlyBeliever={isEarlyBeliever} />

					{/* Notification Channels */}
					<div className="mb-8">
						<h3 className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-4">
							Security & Channels
						</h3>
						
						<NotificationKeyCard />

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
						<div className="text-[11px] font-bold text-herald-red tracking-[2px] uppercase mb-3">
							Danger zone
						</div>
						<Button
							variant="danger"
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
