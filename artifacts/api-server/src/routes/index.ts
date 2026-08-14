// @ts-nocheck
import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import claudeRouter from "./claude";
import openaiRouter from "./openai";
import geminiRouter from "./gemini";
import configRouter from "./config";

const router: IRouter = Router();

router.use(healthRouter);
router.use(claudeRouter);
router.use(openaiRouter);
router.use(geminiRouter);
router.use(configRouter);

export default router;
