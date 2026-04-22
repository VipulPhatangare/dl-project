import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true }
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    messages: { type: [chatMessageSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);