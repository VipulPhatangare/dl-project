import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { searchRelevantChunks } from "../services/vector.service.js";
import { askGemini } from "../services/ai.service.js";
import { Setting } from "../models/Setting.js";
import { Chat } from "../models/Chat.js";

export const createSession = asyncHandler(async (_req, res) => {
  const sessionId = crypto.randomUUID();
  await Chat.create({ sessionId, messages: [] });
  return res.status(201).json({ sessionId });
});

export const getHistory = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ sessionId: req.params.sessionId });
  return res.json({ messages: chat?.messages || [] });
});

export const askChatbot = asyncHandler(async (req, res) => {
  const { sessionId, question } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ message: "Question is required" });
  }

  let finalSessionId = sessionId;
  let chat = finalSessionId ? await Chat.findOne({ sessionId: finalSessionId }) : null;

  if (!chat) {
    finalSessionId = crypto.randomUUID();
    chat = await Chat.create({ sessionId: finalSessionId, messages: [] });
  }

  const queryEmbedding = await generateEmbedding(question);
  const retrieved = await searchRelevantChunks(queryEmbedding, 5);
  const threshold = Math.min(1, Math.max(0, Number(env.retrievalMinScore ?? 0.45)));
  let relevantRetrieved = retrieved.filter((item) => Number(item.score ?? 0) >= threshold);

  if (!relevantRetrieved.length && retrieved.length) {
    const best = [...retrieved].sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))[0];
    const adaptiveFloor = Math.max(0.3, threshold - 0.15);
    if (Number(best?.score ?? 0) >= adaptiveFloor) {
      relevantRetrieved = [best];
    }
  }

  const contextChunks = relevantRetrieved.map((item) => item.content);

  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});

  const answer = await askGemini({
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    systemPrompt: settings.systemPrompt,
    contextChunks,
    question
  });

  chat.messages.push({ role: "user", content: question });
  chat.messages.push({ role: "assistant", content: answer });
  await chat.save();

  return res.json({
    sessionId: finalSessionId,
    answer,
    contextUsed: relevantRetrieved.map((r) => ({ score: r.score, metadata: r.metadata }))
  });
});