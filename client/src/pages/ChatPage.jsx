import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { chatApi } from "../api/chat";
import ChatMessage from "../components/ChatMessage";
import PromptSuggestions from "../components/PromptSuggestions";
import { useTheme } from "../context/ThemeContext";

const CHAT_STORAGE_KEY = "public-chat-history";
const createMessage = (role, content) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  role,
  content
});

export default function ChatPage() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState(() => {
    const cached = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!cached) return [];

    return JSON.parse(cached).map((message) => ({
      id: message.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      role: message.role,
      content: message.content
    }));
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem("chat-session-id") || "");
  const [animatingMessageId, setAnimatingMessageId] = useState("");

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (sessionId) localStorage.setItem("chat-session-id", sessionId);
  }, [sessionId]);

  const welcome = useMemo(
    () => ({ role: "assistant", content: "👋 Welcome! Ask anything based on the knowledge base." }),
    []
  );

  const sendMessage = async (text) => {
    const question = text.trim();
    if (!question || loading) return;

    const nextMessages = [...messages, createMessage("user", question)];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await chatApi.ask({ sessionId, question });
      const assistantMessage = createMessage("assistant", data.answer);
      setSessionId(data.sessionId);
      setAnimatingMessageId(assistantMessage.id);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong. Please try again.";
      const assistantMessage = createMessage("assistant", `⚠️ ${msg}`);
      setAnimatingMessageId(assistantMessage.id);
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async () => {
    try {
      const { data } = await chatApi.newSession();
      setSessionId(data.sessionId);
      setMessages([]);
    } catch {
      setSessionId("");
      setMessages([]);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 backdrop-blur bg-slate-50/80 dark:bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg">AI Chatbot</h1>
          <div className="flex items-center gap-2">
            <button onClick={startNewChat} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm">
              New Chat
            </button>
            <button onClick={clearChat} className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-sm">
              Clear
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-4">
        {!messages.length && <ChatMessage role={welcome.role} content={welcome.content} />}
        {!messages.length && <PromptSuggestions onSelect={(prompt) => setInput(prompt)} />}

        {[...messages].map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            animate={message.id === animatingMessageId && message.role === "assistant"}
            onAnimationDone={() => {
              if (message.id === animatingMessageId) {
                setAnimatingMessageId("");
              }
            }}
          />
        ))}

        {loading && (
          <div className="text-sm text-slate-500 animate-pulse">Assistant is typing...</div>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask a question..."
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading}
            className="px-5 rounded-xl bg-indigo-600 text-white disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}