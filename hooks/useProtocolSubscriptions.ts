"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { type ProtocolSubscription } from "@/types";

export function useProtocolSubscriptions() {
	return useQuery({
		queryKey: ["protocolSubscriptions"],
		queryFn: () => fetchApi<ProtocolSubscription[]>("/portal/subscriptions"),
		staleTime: 30_000,
	});
}

export function useUnsubscribeProtocol() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (protocolId: string) =>
			fetchApi(`/portal/subscriptions/${protocolId}`, { method: "DELETE" }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["protocolSubscriptions"] }),
	});
}

export function useResubscribeProtocol() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (protocolId: string) =>
			fetchApi(`/portal/subscriptions/${protocolId}/resubscribe`, {
				method: "POST",
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["protocolSubscriptions"] }),
	});
}
