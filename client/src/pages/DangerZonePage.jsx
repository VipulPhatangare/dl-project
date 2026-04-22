import { adminApi } from "../api/admin";
import { useUIFeedback } from "../context/UIFeedbackContext";

export default function DangerZonePage() {
  const { confirm, toast } = useUIFeedback();

  const dangerousAction = async (label, fn) => {
    const ok = await confirm({
      title: "Confirm dangerous action",
      message: `Are you sure you want to ${label}? This cannot be undone.`,
      confirmText: "Yes, continue",
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
        message: error.response?.data?.message || "Something went wrong while performing this action."
      });
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-2xl font-bold text-rose-500">Danger Zone</h2>
      <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20 border border-rose-300/70 dark:border-rose-800 rounded-2xl p-5 sm:p-6 space-y-3 shadow-card">
        <p className="text-sm text-rose-700 dark:text-rose-300">These operations are destructive and cannot be undone.</p>
        <button
          onClick={() => dangerousAction("delete all data", adminApi.deleteAllData)}
          className="w-full text-left rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-3 transition"
        >
          Delete all uploaded data (documents + chunks + chats)
        </button>
        <button
          onClick={() => dangerousAction("delete all documents", adminApi.deleteAllDocuments)}
          className="w-full text-left rounded-xl bg-rose-500 hover:bg-rose-400 text-white px-4 py-3 transition"
        >
          Delete all documents and chunks
        </button>
        <button
          onClick={() => dangerousAction("delete all chats", adminApi.deleteAllChats)}
          className="w-full text-left rounded-xl bg-rose-400 hover:bg-rose-300 text-white px-4 py-3 transition"
        >
          Delete all chat history
        </button>
      </div>
    </div>
  );
}