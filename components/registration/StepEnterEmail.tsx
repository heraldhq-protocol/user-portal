"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface StepEnterEmailProps {
  email: string;
  onBack: () => void;
  onSubmit: (email: string) => void;
}

export function StepEnterEmail({ email: initialEmail, onBack, onSubmit }: StepEnterEmailProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isValid, setIsValid] = useState(false);

  const validate = (v: string) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
    setIsValid(valid);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    validate(val);
  };

  return (
    <div>
      <h2 className="text-[26px] font-extrabold tracking-tight mb-2">
        Your email address
      </h2>
      <p className="text-text-muted text-sm mb-6 leading-relaxed">
        Encrypted in your browser before it leaves your device.
      </p>

      {/* Email input */}
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={handleChange}
        className="w-full rounded-[10px] bg-navy-2 border border-border-2 px-4 py-3.5 text-[15px] text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal/30 mb-5"
        aria-label="Email address"
        autoFocus
      />

      {/* Privacy explanation card */}
      <div className="bg-card-2 border border-border-2 rounded-xl p-5 mb-7">
        <div className="text-xs font-bold text-teal uppercase tracking-widest mb-3">
          🔒 How your email is protected
        </div>
        {[
          { icon: "✓", label: "Herald receives", value: "An encrypted blob (unreadable)", positive: true },
          { icon: "✓", label: "Herald receives", value: "A random nonce", positive: true },
          { icon: "✗", label: "Herald never sees", value: "Your actual email address", positive: false },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
            <span className="text-xs mt-0.5">{item.icon}</span>
            <div>
              <span className={`text-xs font-semibold ${item.positive ? "text-text-secondary" : "text-text-muted"}`}>
                {item.label}:{" "}
              </span>
              <span className={`text-xs ${item.positive ? "text-text-secondary" : "text-text-muted"}`}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>
          ← Back
        </Button>
        <Button
          className="flex-1"
          disabled={!isValid}
          onClick={() => onSubmit(email.toLowerCase().trim())}
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
