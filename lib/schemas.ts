import { z } from "zod/v4";

/**
 * Email validation schema for registration (Step 2).
 */
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email too long")
    .email("Invalid email address")
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
      .min(1, "Email is required")
      .max(254, "Email too long")
      .email("Invalid email address")
      .transform((v) => v.toLowerCase().trim()),
    confirmEmail: z.string().min(1, "Confirmation is required"),
  })
  .refine((data) => data.newEmail === data.confirmEmail.toLowerCase().trim(), {
    message: "Emails must match",
    path: ["confirmEmail"],
  });

export type EmailUpdateFormData = z.infer<typeof emailUpdateSchema>;
