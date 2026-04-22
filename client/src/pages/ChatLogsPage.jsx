import { useEffect, useState } from "react";
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

  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Chat Logs</h2>

      <div className="flex flex-wrap gap-2">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-900" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-900" />
        <button onClick={load} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Filter</button>
        <button onClick={exportCsv} className="px-4 py-2 rounded-xl bg-slate-700 text-white">Export</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-card space-y-3">
        {chats.map((chat) => (
          <div key={chat._id} className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <p className="text-xs text-slate-500">Session: {chat.sessionId}</p>
            <p className="text-xs text-slate-500">{new Date(chat.createdAt).toLocaleString()}</p>
            <p className="text-sm">Messages: {chat.messages.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}