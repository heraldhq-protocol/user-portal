"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { useWelcomeNotification, isWelcomeDone } from "@/hooks/useWelcomeNotification";

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
  const [welcomeDone, setWelcomeDone] = useState(() => isWelcomeDone());

  const { data } = useQuery<OnboardingStatus>({
    queryKey: ["onboardingStatus"],
    queryFn: () => fetchApi("/portal/onboarding/status"),
    staleTime: 60_000,
  });

  const { mutate: triggerWelcome, isPending: isTriggeringWelcome } = useWelcomeNotification();

  const handleDismiss = () => {
    setDismissed();
    setDismissedState(true);
  };

  const handleGetFirstNotification = () => {
    triggerWelcome(undefined, {
      onSuccess: () => setWelcomeDone(true),
    });
  };

  if (dismissed || !data) return null;

  // Compose server steps + local welcome step
  const welcomeStep: OnboardingStep = {
    id: "first_notification",
    label: "Get your first notification",
    done: welcomeDone,
  };
  const allSteps = [...data.steps, welcomeStep];
  const completedCount = allSteps.filter((s) => s.done).length;
  const effectiveAllDone = completedCount === allSteps.length;

  if (effectiveAllDone) return null;

  const pct = Math.round((completedCount / allSteps.length) * 100);

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
              {completedCount} of {allSteps.length} steps complete
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
          {allSteps.map((step) => {
            if (step.id === "first_notification") {
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
                    step.done ? "cursor-default" : ""
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
                  {!step.done && (
                    <button
                      onClick={handleGetFirstNotification}
                      disabled={isTriggeringWelcome}
                      className="flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isTriggeringWelcome ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send it
                          <ChevronRight className="size-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            }

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
