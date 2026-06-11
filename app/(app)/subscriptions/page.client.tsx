"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Loader } from "@/components/ui/Loader";
import { ProtocolSubscriptionCard } from "@/components/subscriptions/ProtocolSubscriptionCard";
import {
	useProtocolSubscriptions,
	useUnsubscribeProtocol,
	useResubscribeProtocol,
} from "@/hooks/useProtocolSubscriptions";

export default function SubscriptionsPage() {
	const { data: subscriptions, isLoading, isError } = useProtocolSubscriptions();
	const unsubscribe = useUnsubscribeProtocol();
	const resubscribe = useResubscribeProtocol();
	const [pendingId, setPendingId] = useState<string | null>(null);

	const active = subscriptions?.filter((s) => s.status === "active") ?? [];
	const inactive = subscriptions?.filter((s) => s.status !== "active") ?? [];

	const handleUnsubscribe = (protocolId: string) => {
		setPendingId(protocolId);
		unsubscribe.mutate(protocolId, { onSettled: () => setPendingId(null) });
	};

	const handleResubscribe = (protocolId: string) => {
		setPendingId(protocolId);
		resubscribe.mutate(protocolId, { onSettled: () => setPendingId(null) });
	};

	return (
		<div className="max-w-160 mx-auto px-4 sm:px-6 py-8 sm:py-12">
			{isLoading ? (
				<Loader message="Loading subscriptions..." />
			) : isError ? (
				<div className="text-center text-text-muted py-12">
					Failed to load subscriptions. Please refresh.
				</div>
			) : (
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<div className="mb-8">
						<h1 className="text-xl sm:text-[28px] font-extrabold tracking-tight mb-1.5">
							Protocol subscriptions
						</h1>
						<p className="text-text-muted text-sm">
							Control which protocols can notify you. Unsubscribing stops
							notifications from that protocol only — your Herald account stays
							active.
						</p>
					</div>

					{subscriptions?.length === 0 ? (
						<div className="text-center py-16 text-text-muted">
							<p className="text-sm">No protocol subscriptions yet.</p>
							<p className="text-xs mt-1">
								Visit a protocol&apos;s app and enable Herald notifications to appear
								here.
							</p>
						</div>
					) : (
						<>
							{/* Active */}
							{active.length > 0 && (
								<section className="mb-8">
									<h3 className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-3">
										Active · {active.length}
									</h3>
									<div className="flex flex-col gap-3">
										{active.map((sub) => (
											<ProtocolSubscriptionCard
												key={sub.protocolId}
												subscription={sub}
												onUnsubscribe={() => handleUnsubscribe(sub.protocolId)}
												onResubscribe={() => handleResubscribe(sub.protocolId)}
												isPending={pendingId === sub.protocolId}
											/>
										))}
									</div>
								</section>
							)}

							{/* Inactive */}
							{inactive.length > 0 && (
								<section>
									<h3 className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-3">
										Unsubscribed · {inactive.length}
									</h3>
									<div className="flex flex-col gap-3">
										{inactive.map((sub) => (
											<ProtocolSubscriptionCard
												key={sub.protocolId}
												subscription={sub}
												onUnsubscribe={() => handleUnsubscribe(sub.protocolId)}
												onResubscribe={() => handleResubscribe(sub.protocolId)}
												isPending={pendingId === sub.protocolId}
											/>
										))}
									</div>
								</section>
							)}
						</>
					)}
				</motion.div>
			)}
		</div>
	);
}
