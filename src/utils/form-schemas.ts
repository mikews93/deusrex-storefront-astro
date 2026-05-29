import { z } from 'zod';

// ─── Booking Contact ──────────────────────────────────
// Ported verbatim from the dashboard (frontend/src/utils/form-schemas.ts) so
// the published storefront's booking validation matches the app exactly.
export const bookingContactSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Enter a valid email address'),
    phone: z
      .string()
      .regex(/^[+\d\s()-]{7,20}$/, 'Enter a valid phone number')
      .or(z.literal(''))
      .default(''),
    nationalId: z.string().min(1, 'ID number is required'),
    notes: z.string().optional().default(''),
    /** On-behalf booking fields */
    isOnBehalf: z.boolean().default(false),
    patientFirstName: z.string().default(''),
    patientLastName: z.string().default(''),
    patientNationalId: z.string().default(''),
    patientDateOfBirth: z.string().default(''),
    requesterRelationship: z.string().default(''),
  })
  .superRefine((data, ctx) => {
    if (!data.isOnBehalf) return;
    if (!data.patientFirstName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Patient first name is required',
        path: ['patientFirstName'],
      });
    }
    if (!data.patientLastName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Patient last name is required',
        path: ['patientLastName'],
      });
    }
    if (!data.patientNationalId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Patient ID is required',
        path: ['patientNationalId'],
      });
    }
    if (!data.requesterRelationship) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Relationship is required',
        path: ['requesterRelationship'],
      });
    }
  });
export type BookingContactInput = z.input<typeof bookingContactSchema>;
export type BookingContactData = z.output<typeof bookingContactSchema>;