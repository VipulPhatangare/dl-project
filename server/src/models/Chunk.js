import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", index: true, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const Chunk = mongoose.model("Chunk", chunkSchema);