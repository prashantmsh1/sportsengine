import { z } from "zod";

// Commentary event types
export const COMMENTARY_EVENT_TYPE = {
    GOAL: "goal",
    CARD: "card",
    SUBSTITUTION: "substitution",
    FOUL: "foul",
    CORNER: "corner",
    OFFSIDE: "offside",
    PENALTY: "penalty",
    KICKOFF: "kickoff",
    HALFTIME: "halftime",
    FULLTIME: "fulltime",
    VAR: "var",
    GENERAL: "general",
} as const;

// List commentary query schema
export const listCommentaryQuerySchema = z.object({
    limit: z.coerce.number().positive().max(100).optional(),
});

// Create commentary schema
export const createCommentarySchema = z.object({
    minute: z.coerce.number().int().nonnegative(),
    sequence: z.coerce.number().int().optional(),
    period: z.string().optional(),
    eventType: z.string().optional(),
    actor: z.string().optional(),
    team: z.string().optional(),
    message: z.string().min(1, "Message is required"),
    metadata: z.record(z.string(), z.unknown()).optional(),
    tags: z.array(z.string()).optional(),
});

// Type exports
export type ListCommentaryQuery = z.infer<typeof listCommentaryQuerySchema>;
export type CreateCommentaryInput = z.infer<typeof createCommentarySchema>;
