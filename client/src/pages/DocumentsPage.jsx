import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import { useUIFeedback } from "../context/UIFeedbackContext";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [chunks, setChunks] = useState([]);
  const { confirm, toast } = useUIFeedback();

  const load = async (value = "") => {
    const { data } = await adminApi.documents(value);
    setDocuments(data.documents);
  };

  useEffect(() => {
    load();
  }, []);

  const removeDoc = async (id) => {
    const ok = await confirm({
      title: "Delete document",
      message: "Are you sure you want to delete this document and all its chunks?",
      confirmText: "Delete",
      tone: "danger"
    });
    if (!ok) return;

    try {
      await adminApi.deleteDocument(id);
      await load(search);
      setChunks((prev) => prev.filter((chunk) => chunk.documentId !== id));
      toast({ type: "success", title: "Document deleted" });
    } catch (error) {
      toast({ type: "error", title: "Delete failed", message: error.response?.data?.message || "Please try again." });
    }
  };

  const viewChunks = async (id) => {
    const { data } = await adminApi.chunks(id);
    setChunks(data.chunks);
  };

  const reEmbed = async (id) => {
    try {
      await adminApi.reEmbedDocument(id);
      toast({ type: "success", title: "Re-embedding complete" });
    } catch (error) {
      toast({ type: "error", title: "Re-embedding failed", message: error.response?.data?.message || "Please try again." });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Knowledge Base Manager</h2>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search docs..."
          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-900"
        />
        <button onClick={() => load(search)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
          Search
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2">Title</th>
              <th>Type</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc._id} className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2">{doc.title}</td>
                <td>{doc.fileType}</td>
                <td>{new Date(doc.createdAt).toLocaleString()}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button onClick={() => viewChunks(doc._id)} className="text-indigo-600 hover:text-indigo-500">View Chunks</button>
                  <button onClick={() => reEmbed(doc._id)} className="text-amber-600 hover:text-amber-500">Re-embed</button>
                  <button onClick={() => removeDoc(doc._id)} className="text-rose-600 hover:text-rose-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!!chunks.length && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-card max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Chunks</h3>
          <div className="space-y-3">
            {chunks.map((chunk) => (
              <div key={chunk._id} className="text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                {chunk.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}