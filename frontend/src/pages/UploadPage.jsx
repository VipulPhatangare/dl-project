import { useRef, useState } from "react";
import { CloudUpload, FileText, Upload } from "lucide-react";
import { adminApi } from "../api/admin";
import { useUIFeedback } from "../context/UIFeedbackContext";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualText, setManualText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [embedding, setEmbedding] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useUIFeedback();

  const onUploadFile = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    try {
      const { data } = await adminApi.upload(formData);
      toast({ type: "success", title: "File processed", message: `${data.message} (${data.chunksCount} chunks)` });
      setFile(null);
      setTitle("");
    } catch (error) {
      toast({ type: "error", title: "Upload failed", message: error.response?.data?.message || "Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const onManualSubmit = async (e) => {
    e.preventDefault();
    setEmbedding(true);
    try {
      const { data } = await adminApi.manualText({ title: manualTitle, text: manualText });
      toast({ type: "success", title: "Text embedded", message: `${data.message} (${data.chunksCount} chunks)` });
      setManualText("");
      setManualTitle("");
    } catch (error) {
      toast({ type: "error", title: "Manual text failed", message: error.response?.data?.message || "Please try again." });
    } finally {
      setEmbedding(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const inputBase =
    "w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-sm bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Upload Data</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Add documents or text to your AI knowledge base
        </p>
      </div>

      {/* File upload */}
      <form
        onSubmit={onUploadFile}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold">Upload File</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Supports PDF, CSV, and TXT formats</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <CloudUpload
              size={32}
              className={`mx-auto mb-2 transition-colors ${dragging ? "text-indigo-500" : "text-slate-400"}`}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                <FileText size={15} />
                {file.name}
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Drop file here or click to browse
                </p>
                <p className="text-xs text-slate-500 mt-1">PDF, CSV, TXT — up to 5 MB</p>
              </>
            )}
          </div>

          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputBase}
          />

          <button
            disabled={!file || uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            <Upload size={15} />
            {uploading ? "Uploading…" : "Upload & Process"}
          </button>
        </div>
      </form>

      {/* Manual text */}
      <form
        onSubmit={onManualSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold">Paste Manual Text</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Embed custom text directly into the knowledge base
          </p>
        </div>

        <div className="p-5 space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            className={inputBase}
            required
          />
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Paste your content here…"
            rows={8}
            className={`${inputBase} resize-y scrollbar-thin`}
            required
          />
          <button
            disabled={embedding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {embedding ? "Embedding…" : "Save & Embed"}
          </button>
        </div>
      </form>
    </div>
  );
}
