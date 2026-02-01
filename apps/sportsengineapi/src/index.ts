import express from "express";
import cors from "cors";
import morgan from "morgan";
import { db } from "@repo/database";
const app = express();
const port = 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "sportsengineapi" });
});

app.listen(port, () => {
    console.log(`SportsEngine API started on port ${port}`);
});
