const prompts = [
  "Summarize the main ideas from the uploaded docs.",
  "Explain this concept like I am a beginner.",
  "Give me bullet points with actionable steps.",
  "What information is missing in the current knowledge base?"
];

export default function PromptSuggestions({ onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="text-left border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}