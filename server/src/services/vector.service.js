import { Chunk } from "../models/Chunk.js";
import { env } from "../config/env.js";

export const searchRelevantChunks = async (queryEmbedding, topK = 5) => {
  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: env.vectorIndexName,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: topK
      }
    },
    {
      $project: {
        content: 1,
        metadata: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]);

  return results;
};