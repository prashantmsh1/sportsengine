import express from "express";
import cors from "cors";
import morgan from "morgan";
import { db } from "@repo/database";
import { matchRouter } from "./routes/matches";
const app = express();
const port = 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "sportsengineapi" });
});

app.use("/matches", matchRouter);

const server = app.listen(port, () => {
    console.log(`SportsEngine API started on port ${port}`);
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
