import { Document } from "../models/Document.js";
import { Chunk } from "../models/Chunk.js";
import { Chat } from "../models/Chat.js";
import { Setting } from "../models/Setting.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { extractTextFromFile } from "../services/file.service.js";
import { splitIntoChunks } from "../services/chunk.service.js";
import { generateEmbeddingsBatch } from "../services/embedding.service.js";

const saveDocumentWithChunks = async ({ title, fileType, fileName, text }) => {
  const cleaned = text?.trim();
  if (!cleaned) throw new Error("No extractable text found");

  const document = await Document.create({ title, fileType, fileName });

  const chunks = splitIntoChunks(cleaned, 700, 100);
  const embeddings = await generateEmbeddingsBatch(chunks);

  const chunkDocs = chunks.map((content, index) => ({
    documentId: document._id,
    content,
    embedding: embeddings[index],
    metadata: { chunkIndex: index, title }
  }));

  await Chunk.insertMany(chunkDocs);

  return { document, chunksCount: chunkDocs.length };
};

export const getDashboard = asyncHandler(async (_req, res) => {
  const [totalUploadedFiles, totalChunks, totalChats, recentUploads] = await Promise.all([
    Document.countDocuments(),
    Chunk.countDocuments(),
    Chat.countDocuments(),
    Document.find().sort({ createdAt: -1 }).limit(5)
  ]);

  return res.json({
    totalUploadedFiles,
    totalChunks,
    totalChats,
    recentUploads,
    systemHealth: {
      dbStatus: "healthy",
      apiStatus: "healthy",
      timestamp: new Date().toISOString()
    }
  });
});

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const text = await extractTextFromFile(req.file);
  const fileType = req.file.mimetype.includes("pdf")
    ? "pdf"
    : req.file.mimetype.includes("csv") || req.file.mimetype.includes("excel")
      ? "csv"
      : "txt";

  const result = await saveDocumentWithChunks({
    title: req.body.title || req.file.originalname,
    fileType,
    fileName: req.file.originalname,
    text
  });

  return res.status(201).json({
    message: "Document uploaded and embedded successfully",
    document: result.document,
    chunksCount: result.chunksCount
  });
});

export const uploadManualText = asyncHandler(async (req, res) => {
  const { title, text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ message: "Text is required" });
  }

  const result = await saveDocumentWithChunks({
    title: title || "Manual Text",
    fileType: "manual",
    fileName: "manual-input.txt",
    text
  });

  return res.status(201).json({
    message: "Manual text added and embedded successfully",
    document: result.document,
    chunksCount: result.chunksCount
  });
});

export const getDocuments = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  const query = search ? { title: { $regex: search, $options: "i" } } : {};
  const documents = await Document.find(query).sort({ createdAt: -1 });
  return res.json({ documents });
});

export const getDocumentChunks = asyncHandler(async (req, res) => {
  const chunks = await Chunk.find({ documentId: req.params.id }).sort({ "metadata.chunkIndex": 1 });
  return res.json({ chunks });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Chunk.deleteMany({ documentId: id });
  await Document.findByIdAndDelete(id);
  return res.json({ message: "Document deleted" });
});

export const reEmbedDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const chunks = await Chunk.find({ documentId: id }).sort({ "metadata.chunkIndex": 1 });

  if (!chunks.length) {
    return res.status(404).json({ message: "No chunks found for document" });
  }

  const embeddings = await generateEmbeddingsBatch(chunks.map((c) => c.content));

  await Promise.all(
    chunks.map((chunk, i) =>
      Chunk.updateOne({ _id: chunk._id }, { $set: { embedding: embeddings[i], updatedAt: new Date() } })
    )
  );

  return res.json({ message: "Document re-embedded successfully", chunks: chunks.length });
});

export const getSettings = asyncHandler(async (_req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  return res.json({ settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const payload = req.body;
  const settings = await Setting.findOneAndUpdate({}, { $set: payload }, { new: true, upsert: true });
  return res.json({ message: "Settings updated", settings });
});

export const deleteAllData = asyncHandler(async (_req, res) => {
  await Promise.all([Document.deleteMany({}), Chunk.deleteMany({}), Chat.deleteMany({})]);
  return res.json({ message: "All data deleted (documents, chunks, chats). Admins preserved." });
});

export const deleteAllDocuments = asyncHandler(async (_req, res) => {
  await Promise.all([Document.deleteMany({}), Chunk.deleteMany({})]);
  return res.json({ message: "All documents and chunks deleted" });
});

export const deleteAllChats = asyncHandler(async (_req, res) => {
  await Chat.deleteMany({});
  return res.json({ message: "All chats deleted" });
});

export const getChatLogs = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = {};

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const chats = await Chat.find(query).sort({ createdAt: -1 });
  return res.json({ chats });
});

export const exportChatLogs = asyncHandler(async (req, res) => {
  const chats = await Chat.find().sort({ createdAt: -1 });

  const rows = ["sessionId,createdAt,messagesCount"];
  chats.forEach((chat) => {
    rows.push(`${chat.sessionId},${chat.createdAt.toISOString()},${chat.messages.length}`);
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=chat-logs.csv");
  return res.send(rows.join("\n"));
});