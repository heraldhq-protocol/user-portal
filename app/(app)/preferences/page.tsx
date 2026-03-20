"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const CATEGORIES = [
  { key: "defi", label: "DeFi alerts", desc: "Liquidation warnings, health factor alerts" },
  { key: "governance", label: "Governance", desc: "DAO votes, proposals, quorum alerts" },
  { key: "system", label: "System", desc: "Security, maintenance, critical updates" },
  { key: "marketing", label: "Marketing", desc: "Product updates, newsletters" },
];

const DELIVERY_MODES = [
  { id: "realtime", label: "Real-time", desc: "Delivered immediately" },
  { id: "digest", label: "Daily digest", desc: "Batched every day at 9am UTC" },
];

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    defi: true,
    governance: true,
    system: true,
    marketing: false,
  });
  const [digestMode, setDigestMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const togglePref = (key: string) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-9">
          <h1 className="text-[28px] font-extrabold tracking-tight mb-1.5">
            Preferences
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal" />
            <span className="font-mono text-[13px] text-text-muted">
              7xR4mKp2...nQ
            </span>
          </div>
        </div>

        {/* Notification categories */}
        <Card className="mb-4">
          <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-1">
            Notification categories
          </h3>
          {CATEGORIES.map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between py-4 border-b border-border last:border-b-0"
            >
              <div>
                <div className="text-sm font-semibold text-text-secondary mb-0.5">
                  {label}
                </div>
                <div className="text-xs text-text-muted">{desc}</div>
              </div>
              <button
                onClick={() => togglePref(key)}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer",
                  prefs[key] ? "bg-teal" : "bg-border-2"
                )}
                role="switch"
                aria-checked={prefs[key]}
                aria-label={`Toggle ${label}`}
              >
                <span
                  className={cn(
                    "absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-200",
                    prefs[key] && "translate-x-5"
                  )}
                />
              </button>
            </div>
          ))}
        </Card>

        {/* Delivery mode */}
        <Card className="mb-4">
          <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-4">
            Delivery mode
          </h3>
          {DELIVERY_MODES.map(({ id, label, desc }) => {
            const isActive =
              (id === "digest") === digestMode;
            return (
              <div
                key={id}
                onClick={() => setDigestMode(id === "digest")}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-[10px] cursor-pointer mb-2 transition-all duration-150 border",
                  isActive
                    ? "bg-teal/5 border-teal/20"
                    : "bg-transparent border-border"
                )}
              >
                <div
                  className={cn(
                    "w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center",
                    isActive ? "border-teal" : "border-border-2"
                  )}
                >
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-teal" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-secondary">
                    {label}
                  </div>
                  <div className="text-xs text-text-muted">{desc}</div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Email */}
        <Card className="mb-6">
          <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-3.5">
            Email address
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary blur-email">
              alice@gmail.com
            </span>
            <Button variant="secondary" size="sm">
              Update email
            </Button>
          </div>
        </Card>

        {/* Save */}
        <Button className="w-full justify-center mb-8" onClick={handleSave}>
          {saved ? "✓ Saved" : "Save changes (requires signature)"}
        </Button>

        {/* Danger zone */}
        <div className="border-t border-border pt-6">
          <div className="text-[11px] font-bold text-text-muted tracking-[2px] uppercase mb-3">
            Danger zone
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDelete(true)}
          >
            Delete account
          </Button>
        </div>

        {/* Delete modal */}
        <AnimatePresence>
          {showDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy/85 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-herald-red/30 rounded-2xl p-6 max-w-[420px] w-full"
              >
                <div className="text-xl font-extrabold mb-2.5">
                  Delete account?
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-6">
                  This permanently removes your on-chain IdentityAccount and
                  returns the rent to your wallet. All future notifications to
                  this wallet will be silently dropped. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowDelete(false)}
                  >
                    Cancel
                  </Button>
                  <button className="flex-1 inline-flex items-center justify-center gap-2 bg-herald-red text-white font-bold text-[15px] px-7 py-3 rounded-[10px] hover:bg-herald-red/80 active:scale-[0.97] transition-all duration-150">
                    Delete permanently
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
