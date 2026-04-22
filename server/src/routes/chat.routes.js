import { Router } from "express";
import { askChatbot, createSession, getHistory } from "../controllers/chat.controller.js";

const router = Router();

router.post("/ask", askChatbot);
router.post("/new-session", createSession);
router.get("/history/:sessionId", getHistory);

export default router;