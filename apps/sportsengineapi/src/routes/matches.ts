import { Router } from "express";

import { createMatch, getMatch } from "../controller/match.controller";
export const matchRouter: Router = Router();

matchRouter.post("/", createMatch);

matchRouter.get("/", getMatch);
