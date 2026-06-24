import { useEffect, useState } from "react";
import { Clock, Download, Filter, MessageSquare } from "lucide-react";
import { adminApi } from "../api/admin";

export default function ChatLogsPage() {
  const [chats, setChats] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const load = async () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const { data } = await adminApi.chatLogs(params.toString());
    setChats(data.chats);
  };

  useEffect(() => { load(); }, []);

  const exportCsv = async () => {
    const { data } = await adminApi.exportChatLogs();
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputBase =
    "rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Chat Logs</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Browse and export conversation history
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Start date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputBase} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">End date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputBase} />
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <Filter size={14} />
            Filter
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-medium transition-colors ml-auto"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Logs list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={30} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm text-slate-500">No chat logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Session: <span className="font-mono text-xs text-slate-500">{chat.sessionId}</span>
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Clock size={11} />
                    {new Date(chat.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">
                  <MessageSquare size={11} />
                  {chat.messages.length} msgs
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
