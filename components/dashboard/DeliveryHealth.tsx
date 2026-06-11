"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { CheckCircle2, XCircle, Mail, AlertTriangle } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";

interface HealthData {
  lastDeliveredAt: string | null;
  totalCount: number;
  deliveredCount: number;
  failedCount: number;
  bouncedCount: number;
  deliveryRate: number;
  activeChannels: string[];
}

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  telegram: "Telegram",
  sms: "SMS",
};

export function DeliveryHealth() {
  const { data, isLoading } = useQuery<HealthData>({
    queryKey: ["notificationHealth"],
    queryFn: () => fetchApi("/portal/notifications/health"),
    staleTime: 5 * 60_000,
  });

  if (isLoading || !data || data.totalCount === 0) return null;

  const isHealthy = data.deliveryRate >= 90 && data.failedCount === 0;
  const isWarning = !isHealthy && data.deliveryRate >= 70;
  const isCritical = !isHealthy && !isWarning;

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-3 sm:gap-5 px-4 py-3 rounded-xl border mb-4 text-xs font-semibold",
      isCritical
        ? "bg-herald-red/5 border-herald-red/20"
        : isWarning
          ? "bg-amber-500/5 border-amber-500/20"
          : "bg-teal/5 border-teal/15",
    )}>
      {/* Rate */}
      <div className="flex items-center gap-1.5">
        {isHealthy
          ? <CheckCircle2 className="size-3.5 text-teal shrink-0" />
          : isCritical
            ? <XCircle className="size-3.5 text-herald-red shrink-0" />
            : <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
        }
        <span className={cn(
          isCritical ? "text-herald-red" : isWarning ? "text-amber-400" : "text-teal"
        )}>
          {data.deliveryRate}% delivered
        </span>
      </div>

      {/* Counts */}
      <span className="text-text-muted">{data.deliveredCount} delivered</span>

      {data.failedCount > 0 && (
        <span className="text-herald-red">{data.failedCount} failed</span>
      )}
      {data.bouncedCount > 0 && (
        <span className="text-amber-400">{data.bouncedCount} bounced</span>
      )}

      {/* Channels */}
      {data.activeChannels.length > 0 && (
        <div className="flex items-center gap-1">
          <Mail className="size-3 text-text-muted" />
          <span className="text-text-muted">
            {data.activeChannels.map((c) => CHANNEL_LABELS[c] ?? c).join(" · ")}
          </span>
        </div>
      )}

      {/* Last delivered */}
      {data.lastDeliveredAt && (
        <span className="text-text-muted ml-auto">
          Last: {relativeTime(data.lastDeliveredAt)}
        </span>
      )}
    </div>
  );
}
