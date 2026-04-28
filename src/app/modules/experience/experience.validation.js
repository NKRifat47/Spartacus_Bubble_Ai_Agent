import { z } from "zod";

export const listExperiencesSchema = z.object({
  query: z
    .object({
      city: z.string().trim().min(1).optional(),
      planningType: z.string().trim().min(1).optional(),
      q: z.string().trim().min(1).optional(),
      limit: z.coerce.number().int().positive().max(200).optional(),
    })
    .strict(false),
});

export const listTimesSchema = z.object({
  params: z.object({
    uid: z.string().trim().min(1),
  }),
  query: z
    .object({
      date: z.string().trim().min(8), // YYYY-MM-DD
      people: z.coerce.number().int().positive().optional(),
    })
    .strict(false),
});
