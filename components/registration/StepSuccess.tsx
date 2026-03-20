"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";

interface StepSuccessProps {
  txSignature: string;
}

export function StepSuccess({ txSignature }: StepSuccessProps) {
  return (
    <div className="text-center">
      {/* Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-[72px] h-[72px] bg-teal/12 border-2 border-teal rounded-full flex items-center justify-center text-[28px] mx-auto mb-6"
      >
        ✓
      </motion.div>

      <h2 className="text-[28px] font-extrabold tracking-tight mb-2.5">
        You&rsquo;re registered!
      </h2>
      <p className="text-text-muted text-sm leading-relaxed mb-7 max-w-[360px] mx-auto">
        You&rsquo;ll now receive DeFi alerts from Herald-integrated protocols
        directly to your inbox — without sharing your email with any of them.
      </p>

      {/* Transaction card */}
      <div className="bg-card-2 border border-border-2 rounded-xl p-5 text-left mb-6">
        <div className="text-[11px] text-text-muted font-semibold mb-1.5">
          Transaction
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] text-text-secondary">
            {txSignature}
          </span>
          <a
            href={`https://solscan.io/tx/${txSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal font-semibold hover:text-teal-2 transition-colors"
          >
            View on Solscan ↗
          </a>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex gap-3 mb-4">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just registered for privacy-preserving DeFi notifications with @herald_xyz 🔒⛓️\n\nMy email is encrypted — no protocol ever sees it.\n\nnotify.herald.xyz")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-card text-text-secondary font-semibold text-sm px-5 py-3 rounded-[10px] border border-border-2 hover:border-teal/50 hover:text-text-primary transition-all duration-150"
        >
          Share on 𝕏
        </a>
        <button
          onClick={() => navigator.clipboard.writeText("https://notify.herald.xyz")}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-card text-text-secondary font-semibold text-sm px-5 py-3 rounded-[10px] border border-border-2 hover:border-teal/50 hover:text-text-primary transition-all duration-150"
        >
          Copy link
        </button>
      </div>

      {/* CTA */}
      <Link href="/preferences">
        <Button className="w-full justify-center">
          Manage preferences →
        </Button>
      </Link>
    </div>
  );
}
