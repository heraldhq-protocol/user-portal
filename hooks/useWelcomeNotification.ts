"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { safeStorage } from "@/lib/storage";

const WELCOME_KEY = "herald_welcome_triggered";
const PROTOCOL_ID = process.env.NEXT_PUBLIC_HERALD_PROTOCOL_ID ?? "77a7cf6e-9d3f-4c2b-9d0e-a6217fa7f82c";

export function isWelcomeDone(): boolean {
	return safeStorage.getItem(WELCOME_KEY) === "1";
}

function markWelcomeDone() {
	safeStorage.setItem(WELCOME_KEY, "1");
}

export function useWelcomeNotification() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			// 1. Subscribe to the Herald Protocol (idempotent — ignore if already subscribed)
			try {
				await fetchApi(`/portal/subscriptions/${PROTOCOL_ID}`, { method: "POST" });
			} catch {
				// Already subscribed or other non-critical error; continue to notification
			}

			// 2. Send the welcome notification via the server-side API route
			const token = safeStorage.getItem("herald_portal_token");
			const res = await fetch("/api/herald/welcome", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error((data as { error?: string }).error ?? "Failed to send welcome notification");
			}

			markWelcomeDone();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["protocolSubscriptions"] });
			queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
		},
	});
}
