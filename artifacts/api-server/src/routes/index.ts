// @ts-nocheck
import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import claudeRouter from "./claude.js";
import openaiRouter from "./openai.js";
import geminiRouter from "./gemini.js";
import configRouter from "./config.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(claudeRouter);
router.use(openaiRouter);
router.use(geminiRouter);
router.use(configRouter);

export default router;
