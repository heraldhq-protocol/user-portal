"use client";

import { motion } from "motion/react";

const WALLETS = [
  { name: "Phantom", color: "#AB9FF2" },
  { name: "Solflare", color: "#FC7227" },
  { name: "Backpack", color: "#E33B3B" },
  { name: "Ledger", color: "#999999" },
];

interface StepConnectWalletProps {
  onConnected: (address: string) => void;
}

export function StepConnectWallet({ onConnected }: StepConnectWalletProps) {
  const handleConnect = (walletName: string) => {
    // Simulated wallet connection — will be replaced with real wallet-adapter integration
    const mockAddress = "7xR4mKp2nQwBvTsYjL8d";
    onConnected(mockAddress);
  };

  return (
    <div>
      <h2 className="text-[26px] font-extrabold tracking-tight mb-2">
        Connect your wallet
      </h2>
      <p className="text-text-muted text-sm mb-7 leading-relaxed">
        Your wallet is your identity. No username or password needed.
      </p>

      {/* Wallet grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {WALLETS.map((w) => (
          <motion.button
            key={w.name}
            whileHover={{ scale: 1.02, borderColor: "var(--color-border-2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleConnect(w.name)}
            className="flex items-center gap-2.5 bg-card border border-border rounded-xl p-4 cursor-pointer transition-colors duration-150 hover:border-border-2"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white"
              style={{ background: w.color }}
            >
              {w.name[0]}
            </div>
            <span className="font-semibold text-sm text-text-secondary">
              {w.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Trust message */}
      <div className="px-4 py-3 bg-teal/5 rounded-[10px] border border-teal/12">
        <p className="text-xs text-teal leading-relaxed">
          🔒 Herald only uses your wallet for identity. We never request
          transaction fees at this step.
        </p>
      </div>
    </div>
  );
}
