import createArcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";
import { NextFunction, Request, Response } from "express";

const arcjetKey = process.env.ARCJET_KEY;
const arcjectMode = process.env.ARCJET_ENV != "development" ? "LIVE" : "DRY_RUN";

if (!arcjetKey) {
    throw new Error("ARCJET_KEY is not set");
}

const httpArcjet = arcjetKey
    ? createArcjet({
          key: arcjetKey,

          rules: [
              detectBot({
                  mode: arcjectMode,
                  allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
              }),
              slidingWindow({
                  mode: arcjectMode,
                  max: 50,
                  interval: "20s",
              }),
          ],
      })
    : null;

const wsArcjet = arcjetKey
    ? createArcjet({
          key: arcjetKey,

          rules: [
              detectBot({
                  mode: arcjectMode,
                  allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
              }),
              slidingWindow({
                  mode: arcjectMode,
                  max: 5,
                  interval: "2s",
              }),
          ],
      })
    : null;

export const securityMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!httpArcjet) {
            return next();
        }
        try {
            const decision = await httpArcjet.protect(req);

            console.log(`[Arcjet] Mode: DRY_RUN, Conclusion: ${decision.conclusion}`);

            if (decision.isDenied()) {
                if (decision.reason.isRateLimit()) {
                    return res.status(429).json({ message: "Too many requests" });
                }
                return res.status(403).json({ message: "Forbidden" });
            }
        } catch (error) {
            console.error(error, "Arcjet error");
            return res.status(500).json({ message: "Internal server error" });
        }
        next();
    };
};

export const arcjet = {
    wsArcjet,
    httpArcjet,
};
