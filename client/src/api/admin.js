import { apiClient } from "./client";

export const adminApi = {
  login: (payload) => apiClient.post("/admin/login", payload),
  logout: () => apiClient.post("/admin/logout"),
  profile: () => apiClient.get("/admin/profile"),
  dashboard: () => apiClient.get("/admin/dashboard"),
  upload: (formData) =>
    apiClient.post("/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  manualText: (payload) => apiClient.post("/admin/manual-text", payload),
  documents: (search = "") => apiClient.get(`/admin/documents${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  chunks: (id) => apiClient.get(`/admin/document/${id}/chunks`),
  deleteDocument: (id) => apiClient.delete(`/admin/document/${id}`),
  reEmbedDocument: (id) => apiClient.post(`/admin/document/${id}/re-embed`),
  getSettings: () => apiClient.get("/admin/settings"),
  updateSettings: (payload) => apiClient.put("/admin/settings", payload),
  deleteAllData: () => apiClient.delete("/admin/delete-all-data"),
  deleteAllDocuments: () => apiClient.delete("/admin/delete-all-documents"),
  deleteAllChats: () => apiClient.delete("/admin/delete-all-chats"),
  chatLogs: (params = "") => apiClient.get(`/admin/chats${params ? `?${params}` : ""}`),
  exportChatLogs: () => apiClient.get("/admin/chats/export", { responseType: "blob" })
};