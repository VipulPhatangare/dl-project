import { useEffect, useState } from "react";
import { ChevronDown, FileText, RefreshCw, Search, Trash2, X } from "lucide-react";
import { adminApi } from "../api/admin";
import { useUIFeedback } from "../context/UIFeedbackContext";

const fileTypeBadge = {
  pdf:    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  csv:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  txt:    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  manual: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [chunks, setChunks] = useState([]);
  const [chunksDocId, setChunksDocId] = useState(null);
  const { confirm, toast } = useUIFeedback();

  const load = async (value = "") => {
    const { data } = await adminApi.documents(value);
    setDocuments(data.documents);
  };

  useEffect(() => { load(); }, []);

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
      if (chunksDocId === id) { setChunks([]); setChunksDocId(null); }
      toast({ type: "success", title: "Document deleted" });
    } catch (error) {
      toast({ type: "error", title: "Delete failed", message: error.response?.data?.message || "Please try again." });
    }
  };

  const viewChunks = async (id) => {
    if (chunksDocId === id) { setChunks([]); setChunksDocId(null); return; }
    const { data } = await adminApi.chunks(id);
    setChunks(data.chunks);
    setChunksDocId(id);
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
      <div>
        <h2 className="text-2xl font-bold">Knowledge Base</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your uploaded documents and their embeddings
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(search)}
            placeholder="Search documents…"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={() => load(search)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          Search
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={30} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm text-slate-500">No documents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Uploaded</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {documents.map((doc) => (
                  <tr
                    key={doc._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium max-w-xs">
                        <FileText size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wide ${fileTypeBadge[doc.fileType] || fileTypeBadge.txt}`}>
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => viewChunks(doc._id)}
                          title="View chunks"
                          className={`p-1.5 rounded-lg transition-colors ${
                            chunksDocId === doc._id
                              ? "bg-indigo-600 text-white"
                              : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${chunksDocId === doc._id ? "rotate-180" : ""}`}
                          />
                        </button>
                        <button
                          onClick={() => reEmbed(doc._id)}
                          title="Re-embed"
                          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 transition-colors"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={() => removeDoc(doc._id)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chunks panel */}
      {chunks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold">Document Chunks <span className="text-slate-400 font-normal">({chunks.length})</span></h3>
            <button
              onClick={() => { setChunks([]); setChunksDocId(null); }}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-80 overflow-y-auto scrollbar-thin">
            {chunks.map((chunk, i) => (
              <div key={chunk._id} className="px-5 py-3">
                <p className="text-xs text-slate-400 mb-1 font-medium">Chunk {i + 1}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
