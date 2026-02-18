import { Router } from "express";
import { createCommentary, getCommentry } from "../controller/commentary.controller";

export const commentaryRouter: Router = Router({ mergeParams: true });

commentaryRouter.post("/", createCommentary);
commentaryRouter.get("/", getCommentry);
