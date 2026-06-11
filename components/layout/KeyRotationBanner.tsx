"use client";

import { useState } from "react";
import { AlertTriangle, X, RotateCcw } from "lucide-react";
import { useWalletRegistrationStatus } from "@/hooks/useWalletRegistrationStatus";
import Link from "next/link";

const SESSION_KEY = "herald_key_rotation_dismissed";

const KEY_ROTATION_DAYS = 90;

function isDismissedThisSession(): boolean {
  try { return !!sessionStorage.getItem(SESSION_KEY); } catch { return false; }
}

export function KeyRotationBanner() {
  const [dismissed, setDismissed] = useState(() => isDismissedThisSession());
  const { data: status } = useWalletRegistrationStatus();

  if (dismissed) return null;
  if (!status?.notificationKey?.updatedAt) return null;

  // updatedAt is a Unix timestamp (seconds) from the Solana account
  const updatedAtMs = Number(status.notificationKey.updatedAt) * 1000;
  const daysSince = Math.floor((new Date().getTime() - updatedAtMs) / (1000 * 60 * 60 * 24));
  if (daysSince < KEY_ROTATION_DAYS) return null;

  const handleDismiss = () => {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
    setDismissed(true);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/8 border-b border-amber-500/20 text-xs">
      <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
      <span className="text-amber-300 font-medium flex-1">
        Your notification key is <strong>{daysSince} days old</strong>.
        Rotating it keeps your notifications secure.
      </span>
      <Link
        href="/preferences"
        className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold hover:bg-amber-500/25 transition-colors flex items-center gap-1 shrink-0"
      >
        <RotateCcw className="size-3" />
        Rotate
      </Link>
      <button
        onClick={handleDismiss}
        className="p-0.5 rounded hover:bg-amber-500/15 transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss"
      >
        <X className="size-3.5 text-amber-400/60" />
      </button>
    </div>
  );
}
