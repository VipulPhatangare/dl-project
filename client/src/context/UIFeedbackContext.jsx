import { createContext, useContext, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const UIFeedbackContext = createContext(null);

const TOAST_TTL = 3500;

const typeStyles = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    ringClass: "ring-emerald-500/25"
  },
  error: {
    icon: XCircle,
    iconClass: "text-rose-500",
    ringClass: "ring-rose-500/25"
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    ringClass: "ring-amber-500/25"
  },
  info: {
    icon: Info,
    iconClass: "text-indigo-500",
    ringClass: "ring-indigo-500/25"
  }
};

export function UIFeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const toast = ({ title, message = "", type = "info", duration = TOAST_TTL }) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  };

  const confirm = ({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    tone = "danger"
  }) =>
    new Promise((resolve) => {
      setConfirmState({ title, message, confirmText, cancelText, tone, resolve });
    });

  const onConfirmClose = (answer) => {
    if (confirmState?.resolve) confirmState.resolve(answer);
    setConfirmState(null);
  };

  const value = useMemo(() => ({ toast, confirm }), []);

  return (
    <UIFeedbackContext.Provider value={value}>
      {children}

      <div className="fixed top-4 right-4 z-[70] w-[calc(100vw-2rem)] max-w-sm space-y-3">
        {toasts.map((t) => {
          const styles = typeStyles[t.type] || typeStyles.info;
          const Icon = styles.icon;
          return (
            <div
              key={t.id}
              className={`rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-4 shadow-card ring-1 ${styles.ringClass} backdrop-blur-sm animate-[toast-in_220ms_ease-out]`}
            >
              <div className="flex items-start gap-3">
                <Icon size={18} className={styles.iconClass} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.message ? <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t.message}</p> : null}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close notification"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {confirmState ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card p-6 animate-[modal-in_180ms_ease-out]">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${confirmState.tone === "danger" ? "text-rose-500" : "text-indigo-500"}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">{confirmState.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{confirmState.message}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={() => onConfirmClose(false)}
                className="rounded-xl px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:opacity-90"
              >
                {confirmState.cancelText}
              </button>
              <button
                onClick={() => onConfirmClose(true)}
                className={`rounded-xl px-4 py-2 text-white ${
                  confirmState.tone === "danger" ? "bg-rose-600 hover:bg-rose-500" : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </UIFeedbackContext.Provider>
  );
}

export const useUIFeedback = () => {
  const ctx = useContext(UIFeedbackContext);
  if (!ctx) throw new Error("useUIFeedback must be used inside UIFeedbackProvider");
  return ctx;
};