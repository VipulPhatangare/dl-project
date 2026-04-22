import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    fileType: { type: String, enum: ["pdf", "csv", "txt", "manual"], required: true },
    fileName: { type: String, required: true, trim: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);