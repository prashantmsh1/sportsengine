import { db, commentary, eq, desc } from "@repo/database";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary";
import { matchIdParamSchema } from "../validation/matches";
import { Request, Response } from "express";

export const createCommentary = async (req: Request, res: Response) => {
    try {
        // Validate match ID from params
        const parsedParams = matchIdParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({
                error: "Invalid match ID",
                details: parsedParams.error.issues,
            });
        }

        // Validate request body
        const parsedBody = createCommentarySchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: parsedBody.error.issues,
            });
        }

        const { id: matchId } = parsedParams.data;
        const { minute, sequence, period, eventType, actor, team, message, metadata, tags } =
            parsedBody.data;

        const [result] = await db
            .insert(commentary)
            .values({
                matchId,
                minute,
                sequence,
                period,
                eventType,
                actor,
                team,
                message,
                metadata,
                tags,
            })
            .returning();

        if (req.app.locals.broadcastCommentry) {
            req.app.locals.broadcastCommentry(result.matchId, result);
        }

        res.status(201).json({ message: "Commentary created successfully", commentary: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getCommentry = async (req: Request, res: Response) => {
    try {
        const parsedParams = matchIdParamSchema.safeParse(req.params);
        const queryResult = listCommentaryQuerySchema.safeParse(req.query);
        if (!queryResult.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                details: queryResult.error.issues,
            });
        }
        if (!parsedParams.success) {
            return res.status(400).json({
                error: "Invalid match ID",
                details: parsedParams.error.issues,
            });
        }
        const { limit = 10 } = queryResult.data;
        const { id: matchId } = parsedParams.data;
        const commentry = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        res.status(200).json({ message: "Commentary fetched successfully", commentry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
