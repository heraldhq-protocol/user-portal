"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { NotificationList } from "@/components/notifications/NotificationList";
import { type Notification } from "@/types";

// Mock data initialized properly matching the type
const MOCK_NOTIFICATIONS: Notification[] = [
	{
		id: "1",
		protocolId: "Drift Protocol",
		walletHash: "hash1",
		status: "delivered",
		category: "defi",
		subject: "Liquidation Warning — Action Required. Health factor 1.05",
		queuedAt: new Date(Date.now() - 2 * 60000).toISOString(),
		deliveredAt: new Date(Date.now() - 2 * 60000).toISOString(),
		receiptTx: "5xR4mK",
	},
	{
		id: "2",
		protocolId: "Realms",
		walletHash: "hash2",
		status: "delivered",
		category: "governance",
		subject: "Governance Proposal #47 — Vote closes 24h",
		queuedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
		deliveredAt: new Date(Date.now() - 3 * 3600000).toISOString(),
		receiptTx: "3zK9nP",
	},
	{
		id: "3",
		protocolId: "Marginfi",
		walletHash: "hash3",
		status: "delivered",
		category: "defi",
		subject: "Health Factor Alert — 1.18",
		queuedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
		deliveredAt: new Date(Date.now() - 5 * 3600000).toISOString(),
		receiptTx: "8mQ2vT",
	},
	{
		id: "4",
		protocolId: "Herald",
		walletHash: "hash4",
		status: "delivered",
		category: "system",
		subject: "Security Update — Action Required",
		queuedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
		deliveredAt: new Date(Date.now() - 24 * 3600000).toISOString(),
		receiptTx: "2nX5kL",
	},
];

// Generate some more fake list items for virtualization showcase
for (let i = 5; i <= 50; i++) {
	MOCK_NOTIFICATIONS.push({
		id: String(i),
		protocolId: i % 2 === 0 ? "Drift Protocol" : "Marginfi",
		walletHash: "hash",
		status: "delivered",
		category: "defi",
		subject: `Automated DeFi Alert Notification #${i}. Please check your positions.`,
		queuedAt: new Date(Date.now() - i * 5 * 3600000).toISOString(),
		deliveredAt: new Date(Date.now() - i * 5 * 3600000).toISOString(),
		receiptTx: `txs${i}R4mK`,
	});
}

export default function NotificationsPage() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const t = setTimeout(() => setIsLoading(false), 800);
		return () => clearTimeout(t);
	}, []);

	return (
		<div className="max-w-[700px] mx-auto px-6 py-12 h-[calc(100vh-80px)] font-sans">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex flex-col h-full"
			>
				<h1 className="text-[28px] font-extrabold tracking-tight mb-6 shrink-0">
					Notification history
				</h1>

				<div className="flex-1 min-h-0 bg-transparent">
					<NotificationList notifications={MOCK_NOTIFICATIONS} isLoading={isLoading} />
				</div>
			</motion.div>
		</div>
	);
}
