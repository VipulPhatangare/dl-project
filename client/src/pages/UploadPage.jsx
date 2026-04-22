import { useState } from "react";
import { adminApi } from "../api/admin";
import { useUIFeedback } from "../context/UIFeedbackContext";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualText, setManualText] = useState("");
  const { toast } = useUIFeedback();

  const onUploadFile = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);

    try {
      const { data } = await adminApi.upload(formData);
      toast({
        type: "success",
        title: "File processed",
        message: `${data.message} (${data.chunksCount} chunks)`
      });
      setFile(null);
      setTitle("");
    } catch (error) {
      toast({ type: "error", title: "Upload failed", message: error.response?.data?.message || "Please try again." });
    }
  };

  const onManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await adminApi.manualText({ title: manualTitle, text: manualText });
      toast({
        type: "success",
        title: "Text embedded",
        message: `${data.message} (${data.chunksCount} chunks)`
      });
      setManualText("");
      setManualTitle("");
    } catch (error) {
      toast({ type: "error", title: "Manual text failed", message: error.response?.data?.message || "Please try again." });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Upload Data</h2>

      <form onSubmit={onUploadFile} className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-card space-y-3 border border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold">Upload PDF / CSV / TXT</h3>
        <input type="text" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-transparent" />
        <input type="file" accept=".pdf,.csv,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="text-sm" />
        <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition">Upload</button>
      </form>

      <form onSubmit={onManualSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-card space-y-3 border border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold">Paste Manual Text</h3>
        <input type="text" placeholder="Title" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-transparent" />
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Paste content here..."
          rows={8}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-transparent"
          required
        />
        <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition">Save & Embed</button>
      </form>
    </div>
  );
}