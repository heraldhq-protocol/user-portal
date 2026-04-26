"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { type Notification } from "@/types";
import { fetchApi } from "@/lib/api";
import { useDecryptNotifications } from "@/hooks/useDecryptNotifications";
import { Button } from "@/components/ui/Button";
import { LockOpen, Lock } from "lucide-react";

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { decryptNotifications, isDecrypting } = useDecryptNotifications();
	
	const encryptedCount = notifications.filter((n) => n.ciphertext && !n.message).length;

	const loadNotifications = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await fetchApi<{ notifications: Notification[] }>("/portal/notifications");
			setNotifications(data.notifications);
		} catch (err) {
			console.error("Failed to load notifications:", err);
			setError(err instanceof Error ? err.message : "Failed to load notification history");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadNotifications();
	}, [loadNotifications]);

	const handleDecrypt = async () => {
		const encrypted = notifications.filter((n) => n.ciphertext && n.nonce && !n.message).map((n) => ({
			id: n.id,
			ciphertext: new Uint8Array(Buffer.from(n.ciphertext!, "hex")),
			nonce: new Uint8Array(Buffer.from(n.nonce!, "hex")),
		}));

		if (encrypted.length === 0) return;

		try {
			const decrypted = await decryptNotifications(encrypted);
			
			// Merge decrypted payloads back into notifications
			setNotifications((prev) => 
				prev.map((n) => {
					const d = decrypted.find((dec) => dec.id === n.id);
					if (d) {
						try {
							const payload = JSON.parse(d.plaintext);
							return {
								...n,
								message: payload.message,
								actionUrl: payload.actionUrl,
								subject: payload.subject || n.subject,
							};
						} catch (e) {
							return { ...n, message: d.plaintext };
						}
					}
					return n;
				})
			);
		} catch (err) {
			console.error("Failed to decrypt:", err);
		}
	};

	return (
		<div className="max-w-[700px] mx-auto px-4 sm:px-6 py-8 sm:py-12 h-[calc(100vh-80px)] font-sans">
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex flex-col h-full"
			>
				<div className="flex items-center justify-between mb-6 shrink-0">
					<h1 className="text-[28px] font-extrabold tracking-tight">
						Notification history
					</h1>
					{encryptedCount > 0 && (
						<Button 
							size="sm" 
							variant="secondary" 
							onClick={handleDecrypt} 
							disabled={isDecrypting}
							className="gap-2"
						>
							{isDecrypting ? <Lock className="w-4 h-4 animate-pulse" /> : <LockOpen className="w-4 h-4" />}
							{isDecrypting ? "Decrypting..." : `Decrypt ${encryptedCount} message${encryptedCount !== 1 ? 's' : ''}`}
						</Button>
					)}
				</div>

				{error ? (
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
						className="flex-1 flex items-center justify-center"
					>
						<div className="flex flex-col items-center text-center max-w-sm">
							{/* Error icon */}
							<div className="w-16 h-16 rounded-2xl bg-herald-red/10 border border-herald-red/20 flex items-center justify-center mb-5">
								<svg
									className="w-7 h-7 text-herald-red"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
									/>
								</svg>
							</div>

							<h3 className="text-lg font-bold tracking-tight mb-2">
								Unable to load notifications
							</h3>
							<p className="text-sm text-slate-500 dark:text-text-muted leading-relaxed mb-6">
								{error}
							</p>

							<button
								onClick={loadNotifications}
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-navy font-bold text-sm hover:bg-teal-2 transition-all duration-200 shadow-lg shadow-teal/15 cursor-pointer"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={2}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
									/>
								</svg>
								Try again
							</button>
						</div>
					</motion.div>
				) : (
					<div className="flex-1 min-h-0 bg-transparent">
						<NotificationList notifications={notifications} isLoading={isLoading} />
					</div>
				)}
			</motion.div>
		</div>
	);
}
