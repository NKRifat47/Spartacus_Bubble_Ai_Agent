import { z } from "zod";

export const createBookingSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).optional(),
      email: z.string().trim().email().optional(),
      phone: z.string().trim().min(3).optional(),

      planningType: z.string().trim().min(1).optional(),
      city: z.string().trim().min(1).optional(),
      region: z.string().trim().min(1).optional(),

      people: z.coerce.number().int().positive().optional(),
      date: z.coerce.date().optional(), // accepts ISO string or Date
      timeSlot: z.string().trim().min(1).optional(),

      experienceId: z.string().trim().min(1).optional(),
      experienceName: z.string().trim().min(1).optional(),
      experiencePrice: z.coerce.number().positive().optional(),
      currency: z.string().trim().min(1).optional(),

      activityPrimary: z.string().trim().min(1).optional(),
      activitySecondary: z.string().trim().min(1).optional(),

      customerNote: z.string().trim().max(2000).optional(),
      source: z.string().trim().min(1).optional(),
    })
    .strict(false),
});

