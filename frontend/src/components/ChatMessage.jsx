import { useEffect, useMemo, useState } from "react";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessage({ role, content, animate = false, onAnimationDone }) {
  const isUser = role === "user";
  const tokens = useMemo(() => content.split(/(\s+)/).filter((t) => t.length > 0), [content]);
  const [visibleContent, setVisibleContent] = useState(() => (animate && !isUser ? "" : content));

  useEffect(() => {
    if (isUser || !animate) {
      setVisibleContent(content);
      return;
    }

    setVisibleContent("");
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setVisibleContent(tokens.slice(0, index).join(""));
      if (index >= tokens.length) {
        window.clearInterval(id);
        onAnimationDone?.();
      }
    }, 55);

    return () => window.clearInterval(id);
  }, [animate, content, isUser, onAnimationDone, tokens]);

  if (isUser) {
    return (
      <div className="flex items-end gap-2.5 justify-end fade-in">
        <div className="max-w-[80%] sm:max-w-xl">
          <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm shadow-sm">
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-slate-600 dark:text-slate-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5 justify-start fade-in">
      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="max-w-[80%] sm:max-w-xl">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 text-sm shadow-sm">
          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none code-block">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{visibleContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
