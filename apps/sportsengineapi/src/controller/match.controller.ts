import { db, desc, eq, matches } from "@repo/database";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches";
import { Request, Response } from "express";
import { getMatchStatus } from "../utils/match-status";

const MAX_LIMIT = 100;

export const createMatch = async (req: Request, res: Response) => {
    try {
        const parsed = createMatchSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: parsed.error.issues,
            });
        }
        const {
            data: { sport, homeTeam, awayTeam, startTime, endTime, homeScore, awayScore },
        } = parsed;
        const [match] = await db
            .insert(matches)
            .values({
                sport,
                homeTeam,
                awayTeam,
                startTime,
                endTime,
                homeScore,
                awayScore,
                status: getMatchStatus({
                    startTime,
                    endTime,
                }),
            })
            .returning();
        res.status(201).json({ message: "Match created successfully", match: match });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMatch = async (req: Request, res: Response) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid request query",
            details: parsed.error.issues,
        });
    }
    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);
    try {
        const match = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit);

        res.status(200).json({ data: match });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
