"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  label: string;
  done: boolean;
}

interface OnboardingStatus {
  steps: OnboardingStep[];
  allDone: boolean;
  progress: number;
}

const STEP_LINKS: Record<string, string> = {
  register:  "/preferences",
  email:     "/preferences",
  subscribe: "/discover",
};

const DISMISSED_KEY = "herald_checklist_dismissed";

function isDismissed(): boolean {
  try { return localStorage.getItem(DISMISSED_KEY) === "1"; } catch { return false; }
}
function setDismissed() {
  try { localStorage.setItem(DISMISSED_KEY, "1"); } catch {}
}

export function OnboardingChecklist() {
  const [dismissed, setDismissedState] = useState(() => isDismissed());

  const { data } = useQuery<OnboardingStatus>({
    queryKey: ["onboardingStatus"],
    queryFn: () => fetchApi("/portal/onboarding/status"),
    staleTime: 60_000,
  });

  const handleDismiss = () => {
    setDismissed();
    setDismissedState(true);
  };

  if (dismissed || !data || data.allDone) return null;

  const pct = Math.round((data.progress / data.steps.length) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-2xl p-5 mb-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-text-primary">
              Get started with Herald
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {data.progress} of {data.steps.length} steps complete
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-border transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="size-4 text-text-muted" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-border rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-teal rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2">
          {data.steps.map((step) => {
            const href = STEP_LINKS[step.id] ?? "/preferences";
            return (
              <Link
                key={step.id}
                href={step.done ? "#" : href}
                onClick={step.done ? (e) => e.preventDefault() : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm",
                  step.done
                    ? "cursor-default"
                    : "hover:bg-border cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                  step.done
                    ? "bg-teal border-teal"
                    : "border-border-2 bg-transparent"
                )}>
                  {step.done && <Check className="size-3 text-navy" strokeWidth={3} />}
                </div>
                <span className={cn(
                  "flex-1",
                  step.done ? "text-text-muted line-through" : "text-text-secondary"
                )}>
                  {step.label}
                </span>
                {!step.done && <ChevronRight className="size-4 text-text-muted shrink-0" />}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
