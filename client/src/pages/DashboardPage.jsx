import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  const stats = [
    { label: "Total Uploaded Files", value: data.totalUploadedFiles },
    { label: "Total Chunks", value: data.totalChunks },
    { label: "Total Chats", value: data.totalChats }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-card">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold mb-3">Recent Uploads</h3>
        <div className="space-y-2">
          {data.recentUploads.map((upload) => (
            <div key={upload._id} className="text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
              {upload.title} • {new Date(upload.createdAt).toLocaleString()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}