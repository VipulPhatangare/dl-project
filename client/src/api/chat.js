import { apiClient } from "./client";

export const chatApi = {
  newSession: () => apiClient.post("/chat/new-session"),
  ask: (payload) => apiClient.post("/chat/ask", payload),
  history: (sessionId) => apiClient.get(`/chat/history/${sessionId}`)
};