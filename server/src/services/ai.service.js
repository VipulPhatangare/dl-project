import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error) => {
  const status = error?.status || error?.response?.status;
  const message = String(error?.message || "").toLowerCase();
  return status === 429 || message.includes("429") || message.includes("resource exhausted");
};

const callGeminiWithRetry = async (geminiModel, payload) => {
  const maxRetries = Number(env.geminiMaxRetries ?? 3);
  const baseDelayMs = Number(env.geminiRetryBaseDelayMs ?? 800);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await geminiModel.generateContent(payload);
    } catch (error) {
      if (!isRateLimitError(error) || attempt === maxRetries) {
        throw error;
      }

      const jitter = Math.floor(Math.random() * 250);
      const delayMs = Math.min(8000, baseDelayMs * 2 ** attempt + jitter);
      await sleep(delayMs);
    }
  }

  throw new Error("Gemini request failed after retries");
};

export const askGemini = async ({ model, temperature, maxTokens, systemPrompt, contextChunks, question }) => {
  const chosenModel = model || env.geminiModel || "gemini-2.5-flash";
  const geminiModel = genAI.getGenerativeModel({ model: chosenModel });

  const prompt = `System:\n${systemPrompt}\n\nContext:\n${
    contextChunks.length ? contextChunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n") : "No relevant context found"
  }\n\nQuestion:\n${question}\n\nRules:\n- Answer clearly\n- Use context first\n- If missing info, say unavailable`;

  const result = await callGeminiWithRetry(geminiModel, {
    generationConfig: {
      temperature: Number(temperature ?? 0.3),
      maxOutputTokens: Number(maxTokens ?? 1024)
    },
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  return result.response.text();
};