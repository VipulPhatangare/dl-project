import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessage({ role, content, animate = false, onAnimationDone }) {
  const isUser = role === "user";
  const tokens = useMemo(() => content.split(/(\s+)/).filter((token) => token.length > 0), [content]);
  const [visibleContent, setVisibleContent] = useState(() => (animate && !isUser ? "" : content));

  useEffect(() => {
    if (isUser || !animate) {
      setVisibleContent(content);
      return;
    }

    setVisibleContent("");
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      const next = tokens.slice(0, index).join("");
      setVisibleContent(next);

      if (index >= tokens.length) {
        window.clearInterval(intervalId);
        onAnimationDone?.();
      }
    }, 55);

    return () => window.clearInterval(intervalId);
  }, [animate, content, isUser, onAnimationDone, tokens]);

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl rounded-2xl px-4 py-3 shadow-card ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-slate dark:prose-invert max-w-none code-block">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{visibleContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}