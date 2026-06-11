"use client";

import { useState, useEffect } from "react";
import { Moon, BellOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useQuietHours, useUpdateQuietHours } from "@/hooks/useQuietHours";
import { cn } from "@/lib/utils";

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
});

const TIMEZONES: string[] = (() => {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC", "America/New_York", "America/Chicago", "America/Denver",
      "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo",
      "Asia/Shanghai", "Australia/Sydney"];
  }
})();

const SNOOZE_PRESETS = [
  { label: "1 hour", ms: 60 * 60 * 1000 },
  { label: "4 hours", ms: 4 * 60 * 60 * 1000 },
  { label: "Until tomorrow", ms: null },
];

function tomorrowMidnight(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export function QuietHours() {
  const { data, isLoading } = useQuietHours();
  const update = useUpdateQuietHours();

  const [start, setStart] = useState<number>(22);
  const [end, setEnd] = useState<number>(8);
  const [tz, setTz] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"
  );
  const [enabled, setEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (data.quietHoursStart !== null && data.quietHoursStart !== undefined) {
      setStart(data.quietHoursStart);
      setEnd(data.quietHoursEnd ?? 8);
      setTz(data.quietHoursTz ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC");
      setEnabled(true);
    } else {
      setEnabled(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [data]);

  const snoozeUntil = data?.snoozeUntil ? new Date(data.snoozeUntil) : null;
  const isSnoozed = snoozeUntil && snoozeUntil > new Date();

  const handleSave = async () => {
    await update.mutateAsync({
      quietHoursStart: enabled ? start : null,
      quietHoursEnd: enabled ? end : null,
      quietHoursTz: enabled ? tz : null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSnooze = (ms: number | null) => {
    const until = ms === null
      ? tomorrowMidnight().toISOString()
      : new Date(new Date().getTime() + ms).toISOString();
    update.mutate({ snoozeUntil: until });
  };

  const handleClearSnooze = () => {
    update.mutate({ snoozeUntil: null });
  };

  if (isLoading) {
    return <div className="h-32 animate-pulse bg-border-2 rounded-xl" />;
  }

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5 space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Moon className="size-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Quiet Hours</p>
            <p className="text-[11px] text-text-muted">
              Pause notifications during a daily time window
            </p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors border cursor-pointer shrink-0",
            enabled ? "bg-teal border-teal" : "bg-border-2 border-border"
          )}
        >
          <span
            className={cn(
              "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      {/* Time range + timezone */}
      {enabled && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-1.5 block">
                Start
              </label>
              <select
                value={start}
                onChange={(e) => setStart(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-teal/50 cursor-pointer"
              >
                {HOUR_LABELS.map((label, i) => (
                  <option key={i} value={i}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-1.5 block">
                End
              </label>
              <select
                value={end}
                onChange={(e) => setEnd(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-teal/50 cursor-pointer"
              >
                {HOUR_LABELS.map((label, i) => (
                  <option key={i} value={i}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-1.5 block">
              Timezone
            </label>
            <select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-teal/50 cursor-pointer"
            >
              {TIMEZONES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleSave}
            disabled={update.isPending}
            size="sm"
            className="w-full"
          >
            {update.isPending ? "Saving…" : saved ? "Saved!" : "Save quiet hours"}
          </Button>
        </div>
      )}

      {/* Snooze section */}
      <div className="pt-3 border-t border-border space-y-3">
        <div className="flex items-center gap-2">
          <BellOff className="size-3.5 text-text-muted shrink-0" />
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
            Snooze all notifications
          </p>
        </div>

        {isSnoozed ? (
          <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] text-amber-300 font-medium">
                Snoozed until{" "}
                {snoozeUntil!.toLocaleString(undefined, {
                  month: "short", day: "numeric",
                  hour: "numeric", minute: "2-digit",
                })}
              </span>
            </div>
            <button
              onClick={handleClearSnooze}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {SNOOZE_PRESETS.map(({ label, ms }) => (
              <button
                key={label}
                onClick={() => handleSnooze(ms)}
                disabled={update.isPending}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-2 text-text-muted bg-transparent hover:border-teal/40 hover:text-teal transition-colors cursor-pointer disabled:opacity-60"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
