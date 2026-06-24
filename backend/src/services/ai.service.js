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

const detectPromptMode = (systemPrompt = "") => {
  const prompt = String(systemPrompt || "").toLowerCase();

  const asksContextFirst =
    prompt.includes("use provided context first") ||
    prompt.includes("use context first") ||
    /prioriti[sz]e\s+.*context/.test(prompt);

  const asksUnavailableWhenMissing =
    prompt.includes("if info is unavailable") ||
    prompt.includes("if information is unavailable") ||
    prompt.includes("say it is unavailable") ||
    prompt.includes("say unavailable") ||
    /if\s+.*(info|information|answer).*(unavailable|not available)/.test(prompt);

  return asksContextFirst && asksUnavailableWhenMissing ? "strict-rag" : "hybrid";
};

const cleanHybridResponse = (text = "") => {
  const raw = String(text || "").trim();
  if (!raw) return raw;

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) =>
        !/^\(using general knowledge\)/i.test(line) &&
        !/^using general knowledge[:\-]?/i.test(line) &&
        !/^the provided context (does not|doesn't|does not contain|doesn't contain)/i.test(line) &&
        !/^information about .* unavailable in the provided context\.?$/i.test(line)
    );

  const cleaned = lines.join("\n").trim();
  return cleaned || raw;
};

export const askGemini = async ({ model, temperature, maxTokens, systemPrompt, contextChunks, question }) => {
  const chosenModel = model || env.geminiModel || "gemini-2.5-flash";
  const geminiModel = genAI.getGenerativeModel({ model: chosenModel });

  const hasContext = Array.isArray(contextChunks) && contextChunks.length > 0;
  const mode = detectPromptMode(systemPrompt);

  if (mode === "strict-rag" && !hasContext) {
    return "Information about this is unavailable in the provided context.";
  }

  const fallbackGuidance =
    mode === "strict-rag"
      ? "- Use only provided context. If answer is not present, say it is unavailable in the provided context."
      : hasContext
        ? "- Prioritize provided context. If it is incomplete or irrelevant, answer using general knowledge."
        : "- No relevant context was found. Answer using general knowledge.";

  const styleGuidance =
    mode === "strict-rag"
      ? "- In strict mode, you may mention that information is unavailable in provided context when needed."
      : "- Give only the final answer directly. Do NOT mention database, provided context, retrieval, or that you are using general knowledge unless user explicitly asks about sources.";

  const contextSection = hasContext
    ? contextChunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n")
    : mode === "strict-rag"
      ? "No relevant context found"
      : "Optional context: none";

  const prompt = `System:\n${systemPrompt}\n\nContext:\n${contextSection}\n\nQuestion:\n${question}\n\nRules:\n- Answer clearly and directly\n- Use provided context first when it is relevant\n${
    mode === "strict-rag"
      ? "- Current mode: strict RAG-only (context-only answers)."
      : "- Current mode: hybrid (context-first, then general knowledge if needed)."
  }\n${styleGuidance}\n${
    mode === "strict-rag"
      ? ""
      : "- If context is irrelevant or missing, still answer directly without adding any preface/disclaimer."
  }\n${fallbackGuidance}`;

  const result = await callGeminiWithRetry(geminiModel, {
    generationConfig: {
      temperature: Number(temperature ?? 0.3),
      maxOutputTokens: Number(maxTokens ?? 1024)
    },
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  const answer = result.response.text();
  return mode === "hybrid" ? cleanHybridResponse(answer) : answer;
};