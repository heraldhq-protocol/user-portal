'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { emailSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface StepEnterEmailProps {
  email: string;
  onBack: () => void;
  onSubmit: (email: string) => void;
}

export function StepEnterEmail({ email: initialEmail, onBack, onSubmit }: StepEnterEmailProps) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback((value: string): { isValid: boolean; error: string | null } => {
    // Trim and lowercase for validation
    const trimmedValue = value.trim().toLowerCase();

    try {
      emailSchema.parse({ email: trimmedValue });
      return { isValid: true, error: null };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return { isValid: false, error: err.issues[0]?.message || 'Invalid email address' };
      }
      return { isValid: false, error: 'Invalid email address' };
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);

    // Validate in real-time and update error state
    const validation = validate(val);
    if (touched) {
      setError(validation.error);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const validation = validate(email);
    setError(validation.error);
  };

  const handleSubmit = () => {
    const trimmedEmail = email.trim().toLowerCase();
    const validation = validate(trimmedEmail);

    if (validation.isValid) {
      onSubmit(trimmedEmail);
    } else {
      setError(validation.error);
    }
  };

  // Determine if email is valid
  const isValid = email.trim().length > 0 ? validate(email).isValid : false;

  // Determine if submit button should be disabled
  const isSubmitDisabled = !isValid || (touched && email.length > 0 && !isValid);

  return (
    <div>
      <h2 className="text-[26px] font-extrabold tracking-tight mb-2">Your email address</h2>
      <p className="text-text-muted text-sm mb-6 leading-relaxed">
        Encrypted in your browser before it leaves your device.
      </p>

      {/* Email input */}
      <div className="mb-5">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'w-full rounded-[10px] bg-navy-2 border px-4 py-3.5 text-[15px] text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-1',
            error && touched
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : 'border-border-2 focus:border-teal focus:ring-teal/30',
          )}
          aria-label="Email address"
          aria-invalid={!!error && touched}
          aria-describedby={error && touched ? 'email-error' : undefined}
          autoFocus
        />

        {/* Error message */}
        {error && touched && (
          <p id="email-error" className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}

        {/* Helper text */}
        <p className="mt-2 text-xs text-text-muted">
          Use your primary email address. Plus addressing (e.g., name+tag@example.com) is not
          allowed.
        </p>
      </div>

      {/* Privacy explanation card */}
      <div className="bg-card-2 border border-border-2 rounded-xl p-5 mb-7">
        <div className="text-xs font-bold text-teal uppercase tracking-widest mb-3">
          How your email is protected
        </div>
        {[
          {
            icon: '✓',
            label: 'Herald receives',
            value: 'An encrypted blob (unreadable)',
            positive: true,
          },
          { icon: '✓', label: 'Herald receives', value: 'A random nonce', positive: true },
          {
            icon: '✗',
            label: 'Herald never sees',
            value: 'Your actual email address',
            positive: false,
          },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
            <span className="text-xs mt-0.5">{item.icon}</span>
            <div>
              <span
                className={`text-xs font-semibold ${item.positive ? 'text-text-secondary' : 'text-text-muted'}`}
              >
                {item.label}:{' '}
              </span>
              <span
                className={`text-xs ${item.positive ? 'text-text-secondary' : 'text-text-muted'}`}
              >
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
        <Button className="flex-1" disabled={isSubmitDisabled} onClick={handleSubmit}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
