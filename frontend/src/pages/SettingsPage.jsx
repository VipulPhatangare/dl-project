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

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState(defaultState);
  const [saving, setSaving] = useState(false);
  const { toast } = useUIFeedback();

  useEffect(() => {
    adminApi.getSettings().then(({ data }) => setForm(data.settings));
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setNum = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await adminApi.updateSettings(form);
      setForm(data.settings);
      toast({ type: "success", title: "Settings updated", message: "Bot configuration saved." });
    } catch (error) {
      toast({ type: "error", title: "Save failed", message: error.response?.data?.message || "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-sm bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Bot Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Configure your AI assistant behavior and model parameters
        </p>
      </div>

      {/* Identity section */}
      <Section title="Identity">
        <Field label="Bot Name">
          <input
            value={form.botName ?? ""}
            onChange={set("botName")}
            placeholder="My AI Assistant"
            className={inputBase}
          />
        </Field>
        <Field label="Welcome Message" hint="Shown to users when they first open the chat">
          <input
            value={form.welcomeMessage ?? ""}
            onChange={set("welcomeMessage")}
            placeholder="Hello! How can I help you today?"
            className={inputBase}
          />
        </Field>
      </Section>

      {/* Model section */}
      <Section title="Model Configuration">
        <Field label="Gemini Model">
          <input
            value={form.model ?? ""}
            onChange={set("model")}
            placeholder="gemini-2.5-flash"
            className={inputBase}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label={`Temperature: ${form.temperature}`}
            hint="Higher = more creative, lower = more focused"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={form.temperature ?? 0.3}
              onChange={setNum("temperature")}
              className="w-full accent-indigo-600 mt-1"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Focused (0)</span>
              <span>Creative (1)</span>
            </div>
          </Field>

          <Field
            label={`Max Tokens: ${form.maxTokens}`}
            hint="Maximum response length"
          >
            <input
              type="range"
              min="128"
              max="8192"
              step="128"
              value={form.maxTokens ?? 1024}
              onChange={setNum("maxTokens")}
              className="w-full accent-indigo-600 mt-1"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>128</span>
              <span>8192</span>
            </div>
          </Field>
        </div>
      </Section>

      {/* System prompt section */}
      <Section title="System Prompt">
        <textarea
          rows={8}
          value={form.systemPrompt ?? ""}
          onChange={set("systemPrompt")}
          placeholder="You are a helpful AI assistant…"
          className={`${inputBase} resize-y scrollbar-thin`}
        />
      </Section>

      <button
        disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-colors"
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
