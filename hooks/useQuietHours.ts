"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";

export interface QuietHoursData {
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  quietHoursTz: string | null;
  snoozeUntil: string | null;
}

export interface UpdateQuietHoursInput {
  quietHoursStart?: number | null;
  quietHoursEnd?: number | null;
  quietHoursTz?: string | null;
  snoozeUntil?: string | null;
}

export function useQuietHours() {
  return useQuery({
    queryKey: ["quietHours"],
    queryFn: () => fetchApi<QuietHoursData>("/portal/preferences/quiet-hours"),
    staleTime: 60_000,
  });
}

export function useUpdateQuietHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateQuietHoursInput) =>
      fetchApi<QuietHoursData>("/portal/preferences/quiet-hours", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quietHours"] }),
  });
}
