import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    botName: { type: String, default: "AI Assistant" },
    welcomeMessage: { type: String, default: "Hi! How can I help you today?" },
    systemPrompt: {
      type: String,
      default:
        "You are a helpful AI assistant. Use provided context first. If info is unavailable, clearly say it is unavailable."
    },
    model: { type: String, default: "gemini-2.5-flash" },
    temperature: { type: Number, default: 0.3, min: 0, max: 1 },
    maxTokens: { type: Number, default: 1024, min: 128, max: 8192 }
  },
  { timestamps: true }
);

export const Setting = mongoose.model("Setting", settingSchema);