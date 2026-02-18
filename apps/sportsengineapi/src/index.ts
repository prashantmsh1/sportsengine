import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { matchRouter } from "./routes/matches";
import { attachWebSocketServer } from "./ws/server";
import dotenv from "dotenv";
import { securityMiddleware } from "./configs/arcjet";
import { commentaryRouter } from "./routes/commentry";
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Trust proxy to get correct client IP (needed for Arcjet rate limiting)
app.set("trust proxy", true);

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const server = http.createServer(app);

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "sportsengineapi" });
});

app.use(securityMiddleware());

app.use("/matches", matchRouter);
app.use("/matches/:id/commentry", commentaryRouter);

const { broadcastMatchCreated, broadcastCommentry } = attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentry = broadcastCommentry;
server.listen(PORT, HOST, () => {
    const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    console.log(`SportsEngine API started on port ${baseUrl.replace("http", "ws")}/ws`);
});

// Graceful shutdown handling
const shutdown = () => {
    console.log("\nShutting down gracefully...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });

    // Force close after 5 seconds
    setTimeout(() => {
        console.error("Forcing shutdown");
        process.exit(1);
    }, 5000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Handle nodemon restart (SIGUSR2)
process.once("SIGUSR2", () => {
    server.close(() => {
        process.kill(process.pid, "SIGUSR2");
    });
});
