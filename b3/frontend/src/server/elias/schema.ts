import { z } from "zod";

/** Structured itinerary produced by the draft_plan node — validated before persisting. */
export const eliasItinerarySchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(4000),
  vibeTags: z.array(z.string().max(64)).max(20).default([]),
  /** Rough price orientation for the guest — not a binding quote */
  priceBand: z.enum(["€", "€€", "€€€", "€€€€"]).optional(),
  schedule: z
    .array(
      z.object({
        dayLabel: z.string().max(80),
        blocks: z.array(
          z.object({
            start: z.string().max(40).optional(),
            label: z.string().max(200),
            partnerHint: z.string().max(300).optional(),
          }),
        ),
      }),
    )
    .max(14),
  partners: z.array(
    z.object({
      name: z.string().max(120),
      category: z.string().max(80),
      contactEmail: z.string().email().optional(),
      notes: z.string().max(500).optional(),
    }),
  ),
  availabilityNotes: z.string().max(2000).optional(),
  routeNotes: z.string().max(2000).optional(),
});

export type EliasItinerary = z.infer<typeof eliasItinerarySchema>;

export const graphStateSchema = z.enum([
  "collect_prefs",
  "draft_plan",
  "await_user_approval",
  "compose_partner_emails",
  "completed",
]);

export type EliasGraphState = z.infer<typeof graphStateSchema>;
