import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Moon, Plus, Send, Sun, Trash2 } from "lucide-react";
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
    return JSON.parse(cached).map((m) => ({
      id: m.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      role: m.role,
      content: m.content
    }));
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem("chat-session-id") || "");
  const [animatingMessageId, setAnimatingMessageId] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (sessionId) localStorage.setItem("chat-session-id", sessionId);
  }, [sessionId]);

  const welcome = useMemo(
    () => ({ role: "assistant", content: "Hello! I'm your AI assistant. Ask me anything based on the knowledge base." }),
    []
  );

  const sendMessage = async (text) => {
    const question = text.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, createMessage("user", question)]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      const { data } = await chatApi.ask({ sessionId, question });
      const msg = createMessage("assistant", data.answer);
      setSessionId(data.sessionId);
      setAnimatingMessageId(msg.id);
      setMessages((prev) => [...prev, msg]);
    } catch (error) {
      const text = error.response?.data?.message || "Something went wrong. Please try again.";
      const msg = createMessage("assistant", `⚠️ ${text}`);
      setAnimatingMessageId(msg.id);
      setMessages((prev) => [...prev, msg]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async () => {
    try {
      const { data } = await chatApi.newSession();
      setSessionId(data.sessionId);
    } catch {
      setSessionId("");
    }
    setMessages([]);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md bg-white/80 dark:bg-slate-950/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">AI Assistant</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Knowledge Base Chat</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
            <button
              onClick={clearChat}
              title="Clear history"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="fade-in">
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                  <Bot size={32} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold">How can I help you?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                  Ask me anything based on the knowledge base.
                </p>
              </div>

              <ChatMessage role={welcome.role} content={welcome.content} />

              <div className="mt-4">
                <PromptSuggestions onSelect={(p) => sendMessage(p)} />
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              animate={msg.id === animatingMessageId && msg.role === "assistant"}
              onAnimationDone={() => {
                if (msg.id === animatingMessageId) setAnimatingMessageId("");
              }}
            />
          ))}

          {loading && (
            <div className="flex items-end gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 dot-1" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 dot-2" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 dot-3" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all scrollbar-thin"
              style={{ minHeight: "48px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            AI can make mistakes — verify important information.
          </p>
        </div>
      </footer>
    </div>
  );
}
