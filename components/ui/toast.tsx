"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import * as React from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  show: (type: ToastType, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // Fallback so it never throws if used outside provider
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    } as ToastContextValue;
  }
  return ctx;
}

const iconFor: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colorFor: Record<ToastType, string> = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-200",
  error: "text-rose-600 bg-rose-50 border-rose-200",
  info: "text-indigo-600 bg-indigo-50 border-indigo-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = React.useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  const value = React.useMemo<ToastContextValue>(
    () => ({
      show,
      success: (title, description) => show("success", title, description),
      error: (title, description) => show("error", title, description),
      info: (title, description) => show("info", title, description),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = iconFor[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 32, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 32, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.10)] dark:bg-slate-900 dark:border-slate-800`}
              >
                <div className={`rounded-lg p-1.5 ${colorFor[t.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-slate-500">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}