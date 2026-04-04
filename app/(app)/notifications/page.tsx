"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { type Notification } from "@/types";

import { fetchApi } from "@/lib/api";

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadNotifications() {
			try {
				const data = await fetchApi<{ notifications: Notification[] }>("/portal/notifications");
				setNotifications(data.notifications);
			} catch (err) {
				console.error("Failed to load notifications:", err);
				setError("Failed to load notification history");
			} finally {
				setIsLoading(false);
			}
		}

		loadNotifications();
	}, []);

	return (
		<div className="max-w-[700px] mx-auto px-4 sm:px-6 py-8 sm:py-12 h-[calc(100vh-80px)] font-sans">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex flex-col h-full"
			>
				<h1 className="text-[28px] font-extrabold tracking-tight mb-6 shrink-0">
					Notification history
				</h1>

				{error ? (
					<div className="text-red py-4">{error}</div>
				) : (
					<div className="flex-1 min-h-0 bg-transparent">
						<NotificationList notifications={notifications} isLoading={isLoading} />
					</div>
				)}
			</motion.div>
		</div>
	);
}
