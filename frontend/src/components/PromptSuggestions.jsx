import { BookOpen, Lightbulb, List, Search } from "lucide-react";

const prompts = [
  { icon: BookOpen, text: "Summarize the main ideas from the uploaded docs." },
  { icon: Lightbulb, text: "Explain this concept like I am a beginner." },
  { icon: List, text: "Give me bullet points with actionable steps." },
  { icon: Search, text: "What information is missing in the current knowledge base?" }
];

export default function PromptSuggestions({ onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {prompts.map(({ icon: Icon, text }) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          className="text-left flex items-start gap-3 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 bg-white/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group"
        >
          <Icon
            size={15}
            className="text-indigo-500 mt-0.5 flex-shrink-0 group-hover:text-indigo-600 transition-colors"
          />
          <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors leading-snug">
            {text}
          </span>
        </button>
      ))}
    </div>
  );
}
