"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as React from "react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    return { confirm: async () => window.confirm("Are you sure?") };
  }
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [opts, setOpts] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<(value: boolean) => void>(() => {});

  const confirm = React.useCallback((options: ConfirmOptions) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    setOpen(false);
    resolverRef.current(result);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {open && opts && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => close(false)}
              className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.15)] dark:bg-slate-900 dark:border-slate-800"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      opts.danger
                        ? "bg-rose-50 text-rose-600"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {opts.title}
                    </h3>
                    {opts.description && (
                      <p className="mt-1 text-sm text-slate-500">{opts.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => close(false)}>
                    {opts.cancelLabel || "Cancel"}
                  </Button>
                  <Button
                    variant={opts.danger ? "danger" : "primary"}
                    size="sm"
                    onClick={() => close(true)}
                  >
                    {opts.confirmLabel || "Confirm"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}