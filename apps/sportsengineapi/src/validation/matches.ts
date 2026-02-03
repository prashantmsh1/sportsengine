import { z } from "zod";

// Match status constants
export const MATCH_STATUS = {
    SCHEDULED: "scheduled",
    LIVE: "live",
    FINISHED: "finished",
} as const;

// Helper to validate ISO date strings
const isValidIsoDate = (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
};

// List matches query schema
export const listMatchesQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

// Match ID param schema
export const matchIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

// Create match schema
export const createMatchSchema = z
    .object({
        sport: z.string().min(1, "Sport is required"),
        homeTeam: z.string().min(1, "Home team is required"),
        awayTeam: z.string().min(1, "Away team is required"),
        startTime: z
            .string()
            .refine(isValidIsoDate, { message: "startTime must be a valid ISO date string" })
            .transform((val) => new Date(val)), // ← Convert string to Date
        endTime: z
            .string()
            .refine(isValidIsoDate, { message: "endTime must be a valid ISO date string" })
            .transform((val) => new Date(val)), // ← Convert string to Date
        homeScore: z.coerce.number().int().nonnegative().optional(),
        awayScore: z.coerce.number().int().nonnegative().optional(),
    })
    .superRefine((data, ctx) => {
        // Now data.startTime and data.endTime are Date objects
        if (data.endTime <= data.startTime) {
            ctx.addIssue({
                code: "custom",
                message: "endTime must be chronologically after startTime",
                path: ["endTime"],
            });
        }
    });

// Update score schema
export const updateScoreSchema = z.object({
    homeScore: z.coerce.number().int().nonnegative(),
    awayScore: z.coerce.number().int().nonnegative(),
});

// Type exports
export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>;
export type MatchIdParam = z.infer<typeof matchIdParamSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
