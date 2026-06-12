'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, Mail, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchApi } from '@/lib/api';
import { saveOtpSession, getValidOtpSession } from '@/lib/otpSession';

interface StepVerifyEmailProps {
  email: string;
  maskedEmail: string;
  walletPubkey: string;
  onBack: () => void;
  onVerified: (emailVerifiedToken: string) => void;
  alreadySent?: boolean;
  minutesRemaining?: number;
}

const RESEND_COOLDOWN = 60; // seconds

export function StepVerifyEmail({
  email,
  maskedEmail,
  walletPubkey,
  onBack,
  onVerified,
  alreadySent = false,
  minutesRemaining,
}: StepVerifyEmailProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // If OTP was already sent (page refresh scenario), don't start the resend cooldown —
  // the user can resend immediately if they want a fresh code.
  const [cooldown, setCooldown] = useState(alreadySent ? 0 : RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Skip OTP entirely if this email was already verified recently (cached session)
  useEffect(() => {
    const cached = getValidOtpSession(email, walletPubkey);
    if (cached) onVerified(cached);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start cooldown timer immediately (OTP was just sent by the previous step)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    // Support multi-digit pasting or autocomplete in single input box
    if (cleanValue.length > 1) {
      const next = [...digits];
      for (let i = 0; i < cleanValue.length && index + i < 6; i++) {
        next[index + i] = cleanValue[i];
      }
      setDigits(next);
      setError(null);

      const lastFilledIndex = Math.min(index + cleanValue.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();

      const code = next.join('');
      if (code.length === 6) {
        submitCode(code);
      }
      return;
    }

    const digit = cleanValue.slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (digit && index === 5) {
      const code = [...next.slice(0, 5), digit].join('');
      if (code.length === 6) submitCode(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] ?? '';
    }
    setDigits(next);
    setError(null);
    // Focus last filled or next empty
    const lastFilled = Math.min(pasted.length - 1, 5);
    inputRefs.current[lastFilled]?.focus();
    if (pasted.length === 6) submitCode(pasted);
  };

  const submitCode = useCallback(
    async (code: string) => {
      if (isVerifying) return;
      setIsVerifying(true);
      setError(null);
      try {
        const res = await fetchApi<{ verified: boolean; emailVerifiedToken?: string; error?: string }>(
          '/auth/email/otp/verify',
          {
            method: 'POST',
            body: JSON.stringify({ email, code, walletPubkey }),
          },
        );
        if (res.verified && res.emailVerifiedToken) {
          saveOtpSession(email, walletPubkey, res.emailVerifiedToken);
          onVerified(res.emailVerifiedToken);
        } else {
          setError(res.error ?? 'Verification failed. Please try again.');
          // Clear digits on wrong code
          setDigits(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      } catch {
        setError('Could not verify code. Check your connection and try again.');
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } finally {
        setIsVerifying(false);
      }
    },
    [email, walletPubkey, isVerifying, onVerified],
  );

  const handleManualSubmit = () => {
    const code = digits.join('');
    if (code.length === 6) submitCode(code);
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    setDigits(['', '', '', '', '', '']);
    try {
      await fetchApi('/auth/email/otp/send', {
        method: 'POST',
        // force: true — bypass idempotency and send a fresh code
        body: JSON.stringify({ email, walletPubkey, force: true }),
      });
      setCooldown(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const allFilled = digits.every((d) => d !== '');

  return (
    <div>
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal/10 border border-teal/20 mb-5">
        <Mail className="size-5 text-teal" />
      </div>

      <h2 className="text-[26px] font-extrabold tracking-tight mb-2">Check your inbox</h2>
      <p className="text-text-muted text-sm mb-1 leading-relaxed">
        We sent a 6-digit code to
      </p>
      <p className="text-sm font-bold text-text-primary mb-4">{maskedEmail}</p>

      {alreadySent && (
        <div className="bg-teal/10 border border-teal/20 rounded-xl px-4 py-3 text-xs text-teal text-center mb-4">
          A code was already sent{minutesRemaining != null ? ` — it expires in ${minutesRemaining} min` : ''}. Enter it below, or click &ldquo;Resend code&rdquo; for a fresh one.
        </div>
      )}

      {/* OTP digit inputs */}
      <div className="flex gap-2 sm:gap-3 mb-5 justify-center" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            autoFocus={i === 0}
            className={cn(
              'w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 bg-navy-2 text-primary-foreground caret-transparent select-none',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : digit
                  ? 'border-teal focus:border-teal focus:ring-teal/30'
                  : 'border-border-2 focus:border-teal/60 focus:ring-teal/20',
            )}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 text-center mb-4 flex items-center justify-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}

      {/* Resend */}
      <p className="text-xs text-text-muted text-center mb-6">
        Didn&rsquo;t receive it?{' '}
        {cooldown > 0 ? (
          <span className="text-text-muted">Resend in {cooldown}s</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex items-center gap-1 text-teal hover:underline font-semibold cursor-pointer disabled:opacity-50"
          >
            {isResending && <RefreshCw className="size-3 animate-spin" />}
            Resend code
          </button>
        )}
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} disabled={isVerifying}>
          ← Back
        </Button>
        <Button
          className="flex-1"
          disabled={!allFilled || isVerifying}
          onClick={handleManualSubmit}
        >
          {isVerifying ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Verifying…
            </span>
          ) : (
            'Verify →'
          )}
        </Button>
      </div>
    </div>
  );
}
