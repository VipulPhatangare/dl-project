import { Router } from "express";
import { adminAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  deleteAllChats,
  deleteAllData,
  deleteAllDocuments,
  deleteDocument,
  exportChatLogs,
  getChatLogs,
  getDashboard,
  getDocumentChunks,
  getDocuments,
  getSettings,
  reEmbedDocument,
  updateSettings,
  uploadDocument,
  uploadManualText
} from "../controllers/admin.controller.js";

const router = Router();

router.use(adminAuth);

router.get("/dashboard", getDashboard);
router.post("/upload", upload.single("file"), uploadDocument);
router.post("/manual-text", uploadManualText);
router.get("/documents", getDocuments);
router.get("/document/:id/chunks", getDocumentChunks);
router.post("/document/:id/re-embed", reEmbedDocument);
router.delete("/document/:id", deleteDocument);
router.delete("/delete-all-data", deleteAllData);
router.delete("/delete-all-documents", deleteAllDocuments);
router.delete("/delete-all-chats", deleteAllChats);
router.get("/chats", getChatLogs);
router.get("/chats/export", exportChatLogs);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;