import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import { useUIFeedback } from "../context/UIFeedbackContext";

const defaultState = {
  botName: "",
  welcomeMessage: "",
  systemPrompt: "",
  model: "gemini-2.5-flash",
  temperature: 0.3,
  maxTokens: 1024
};

export default function SettingsPage() {
  const [form, setForm] = useState(defaultState);
  const { toast } = useUIFeedback();

  useEffect(() => {
    adminApi.getSettings().then(({ data }) => setForm(data.settings));
  }, []);

  const save = async (e) => {
    e.preventDefault();

    try {
      const { data } = await adminApi.updateSettings(form);
      setForm(data.settings);
      toast({ type: "success", title: "Settings updated", message: "Bot configuration saved successfully." });
    } catch (error) {
      toast({ type: "error", title: "Save failed", message: error.response?.data?.message || "Please try again." });
    }
  };

  return (
    <form onSubmit={save} className="space-y-4 max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
      <h2 className="text-2xl font-bold">Bot Settings</h2>

      {[
        ["botName", "Bot Name"],
        ["welcomeMessage", "Welcome Message"],
        ["model", "Gemini Model"]
      ].map(([field, label]) => (
        <div key={field}>
          <label className="block text-sm mb-1">{label}</label>
          <input
            value={form[field] ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-900"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm mb-1">System Prompt</label>
        <textarea
          rows={7}
          value={form.systemPrompt ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, systemPrompt: e.target.value }))}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-900"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Temperature</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={form.temperature ?? 0.3}
            onChange={(e) => setForm((prev) => ({ ...prev, temperature: Number(e.target.value) }))}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Max Tokens</label>
          <input
            type="number"
            min="128"
            max="8192"
            value={form.maxTokens ?? 1024}
            onChange={(e) => setForm((prev) => ({ ...prev, maxTokens: Number(e.target.value) }))}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition">Save Settings</button>
    </form>
  );
}