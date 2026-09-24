import { Router } from "express";
import { generateContent, getHistory } from "../controllers/aiController";

const router = Router();

// POST /api/ai/generate - Generate content and save history
router.post("/generate", generateContent);

// GET /api/ai/history/:telegramId - Get generation history for a user
router.get("/history/:telegramId", getHistory);

export default router;
