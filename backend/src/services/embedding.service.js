import OpenAI from "openai";
import { env } from "../config/env.js";

const client = new OpenAI({ apiKey: env.openAiApiKey });

export const generateEmbedding = async (text) => {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return response.data[0].embedding;
};

export const generateEmbeddingsBatch = async (texts) => {
  if (!texts.length) return [];

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts
  });

  return response.data.map((item) => item.embedding);
};