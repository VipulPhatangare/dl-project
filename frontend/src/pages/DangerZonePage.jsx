import { ShieldAlert, Trash2 } from "lucide-react";
import { adminApi } from "../api/admin";
import { useUIFeedback } from "../context/UIFeedbackContext";

const actions = [
  {
    label: "Delete all data",
    description: "Permanently removes all documents, chunks, and chat history.",
    fn: adminApi.deleteAllData
  },
  {
    label: "Delete all documents & chunks",
    description: "Removes all uploaded documents and their embeddings. Chat history is preserved.",
    fn: adminApi.deleteAllDocuments
  },
  {
    label: "Delete all chat history",
    description: "Clears all conversation logs. Documents and embeddings are preserved.",
    fn: adminApi.deleteAllChats
  }
];

export default function DangerZonePage() {
  const { confirm, toast } = useUIFeedback();

  const dangerousAction = async (label, fn) => {
    const ok = await confirm({
      title: "Confirm dangerous action",
      message: `Are you sure you want to ${label.toLowerCase()}? This cannot be undone.`,
      confirmText: "Yes, delete",
      tone: "danger"
    });
    if (!ok) return;

    try {
      await fn();
      toast({ type: "success", title: "Action completed", message: `${label} completed successfully.` });
    } catch (error) {
      toast({
        type: "error",
        title: "Action failed",
        message: error.response?.data?.message || "Something went wrong."
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-500 flex items-center gap-2">
          <ShieldAlert size={22} />
          Danger Zone
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          These operations are permanent and cannot be reversed.
        </p>
      </div>

      <div className="rounded-2xl border border-rose-200 dark:border-rose-800/60 overflow-hidden">
        {/* Header banner */}
        <div className="flex items-center gap-2 px-5 py-3 bg-rose-50 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-800/60">
          <ShieldAlert size={14} className="text-rose-500 flex-shrink-0" />
          <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
            All destructive actions require confirmation
          </p>
        </div>

        {/* Action rows */}
        <div className="bg-white dark:bg-slate-900 divide-y divide-rose-100 dark:divide-rose-900/30">
          {actions.map((action) => (
            <div
              key={action.label}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-rose-50/40 dark:hover:bg-rose-950/10 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{action.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{action.description}</p>
              </div>
              <button
                onClick={() => dangerousAction(action.label, action.fn)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
