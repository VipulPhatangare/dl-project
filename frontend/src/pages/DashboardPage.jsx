import { useEffect, useState } from "react";
import { Clock, FileText, Hash, MessageSquare } from "lucide-react";
import { adminApi } from "../api/admin";

const colorMap = {
  indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
};

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`} />;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const stats = [
    { label: "Uploaded Files",  value: data.totalUploadedFiles, icon: FileText,     color: "indigo"  },
    { label: "Total Chunks",    value: data.totalChunks,        icon: Hash,          color: "violet"  },
    { label: "Total Chats",     value: data.totalChats,         icon: MessageSquare, color: "emerald" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Overview of your AI chatbot platform
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm fade-in"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-3xl font-bold mt-2">{value ?? "—"}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                <Icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent uploads */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold">Recent Uploads</h3>
        </div>

        {data.recentUploads.length === 0 ? (
          <div className="text-center py-10">
            <FileText size={28} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-500">No uploads yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.recentUploads.map((upload) => (
              <div key={upload._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.title}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Clock size={11} />
                    {new Date(upload.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
