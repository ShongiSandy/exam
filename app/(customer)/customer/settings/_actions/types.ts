// app/(customer)/settings/_actions/types.ts

import { z } from "zod";

// --- Profile Info Update Schema ---
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().nullable(),
  country: z.string().min(1, "Country is required"),
  postcode: z.string().min(1, "Postcode is required"),
  streetAddress: z.string().optional().nullable(),
  suburb: z.string().optional().nullable(),
  townCity: z.string().optional().nullable(),
});
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

// --- Checkout PREFERENCE Schema ---
export const checkoutDetailsSchema = z.object({
  shippingAddress: z.string().min(1, "Shipping address is required"),
  billingAddress: z.string().min(1, "Billing address is required"),
  shippingMethod: z.string(),
  paymentMethod: z.string(),
  saveInfo: z.boolean()
});

export type CheckoutDetailsFormValues = z.infer<typeof checkoutDetailsSchema>;

// --- General Action Result Types ---
export interface UpdateActionResult {
  success?: string | null;
  error?: string | null;
}
// Exported because it's used by the action which is imported by the page
export interface ProfileUpdateActionResult extends UpdateActionResult {
  updatedUser?: Partial<ProfileUpdateFormValues>;
}

// --- Password Change Schema ---
export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters" })
      .max(255, { message: "Password cannot exceed 255 characters" })
      .regex(/[A-Z]/, { message: "Password requires an uppercase letter" })
      .regex(/[a-z]/, { message: "Password requires a lowercase letter" })
      .regex(/[0-9]/, { message: "Password requires a number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password requires a special character",
      }),
    confirmNewPassword: z
      .string()
      .min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export interface PasswordChangeResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Partial<
    Record<"currentPassword" | "newPassword" | "confirmNewPassword", string>
  >;
}
