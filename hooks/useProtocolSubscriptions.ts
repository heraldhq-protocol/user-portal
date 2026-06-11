"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { type ProtocolSubscription, type DiscoverableProtocol } from "@/types";

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

export function useDiscoverProtocols() {
	return useQuery({
		queryKey: ["discoverProtocols"],
		queryFn: () => fetchApi<DiscoverableProtocol[]>("/portal/protocols"),
		staleTime: 60_000,
	});
}

export function useSubscribeToProtocol() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (protocolId: string) =>
			fetchApi(`/portal/subscriptions/${protocolId}`, {
				method: "POST",
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["discoverProtocols"] });
			queryClient.invalidateQueries({ queryKey: ["protocolSubscriptions"] });
		},
	});
}

export interface ProtocolPreferences {
	protocolId: string;
	optInDefi: boolean | null;
	optInGovernance: boolean | null;
	optInMarketing: boolean | null;
	optInSystem: boolean | null;
	channels: string[];
}

export function useProtocolPreferences(protocolId: string) {
	return useQuery({
		queryKey: ["protocolPreferences", protocolId],
		queryFn: () => fetchApi<ProtocolPreferences>(`/portal/subscriptions/${protocolId}/preferences`),
		staleTime: 30_000,
		enabled: !!protocolId,
	});
}

export function useUpdateProtocolPreferences() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			protocolId,
			...body
		}: Partial<ProtocolPreferences> & { protocolId: string }) =>
			fetchApi<ProtocolPreferences>(`/portal/subscriptions/${protocolId}/preferences`, {
				method: "PUT",
				body: JSON.stringify(body),
			}),
		onSuccess: (data) => {
			queryClient.setQueryData(["protocolPreferences", data.protocolId], data);
		},
	});
}

export function useDiscoverUnsubscribe() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (protocolId: string) =>
			fetchApi(`/portal/subscriptions/${protocolId}`, { method: "DELETE" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["discoverProtocols"] });
			queryClient.invalidateQueries({ queryKey: ["protocolSubscriptions"] });
		},
	});
}
