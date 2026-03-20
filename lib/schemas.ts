import { z } from 'zod';

/**
 * Email validation schema for registration (Step 2).
 * Rejects:
 * - Plus addressing (alice+1@example.com)
 * - Percent signs (alice%test@example.com)
 * - Spaces
 * - Invalid formats
 */
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email is too long (max 254 characters)')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address')
    .refine(
      (email) => !email.includes('+'),
      'Email addresses with "+" (plus addressing) are not allowed. Please use your primary email address.',
    )
    .refine(
      (email) => !email.includes('%'),
      'Email addresses with "%" are not allowed. Please use your primary email address.',
    )
    .refine((email) => {
      // Additional check for local part (before @) to ensure no special patterns
      const localPart = email.split('@')[0];
      return !/[+%]/.test(localPart);
    }, 'Please use your primary email address without modifiers (+ or %)')
    .transform((v) => v.toLowerCase().trim()),
});

export type EmailFormData = z.infer<typeof emailSchema>;

/**
 * Notification preference toggles + delivery mode.
 */
export const preferencesSchema = z.object({
  optInDefi: z.boolean(),
  optInGovernance: z.boolean(),
  optInSystem: z.boolean(),
  optInMarketing: z.boolean(),
  digestMode: z.boolean(),
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;

/**
 * Email update requires new email + confirmation.
 */
export const emailUpdateSchema = z
  .object({
    newEmail: z
      .string()
      .min(1, 'Email is required')
      .max(254, 'Email is too long (max 254 characters)')
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address')
      .refine(
        (email) => !email.includes('+'),
        'Email addresses with "+" (plus addressing) are not allowed. Please use your primary email address.',
      )
      .refine(
        (email) => !email.includes('%'),
        'Email addresses with "%" are not allowed. Please use your primary email address.',
      )
      .refine((email) => {
        const localPart = email.split('@')[0];
        return !/[+%]/.test(localPart);
      }, 'Please use your primary email address without modifiers (+ or %)')
      .transform((v) => v.toLowerCase().trim()),
    confirmEmail: z.string().min(1, 'Please confirm your email address'),
  })
  .refine((data) => data.newEmail === data.confirmEmail.toLowerCase().trim(), {
    message: 'Email addresses must match',
    path: ['confirmEmail'],
  });

export type EmailUpdateFormData = z.infer<typeof emailUpdateSchema>;
