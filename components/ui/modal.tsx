"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import * as React from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const widths = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className={`relative w-full ${widths[size]} rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.15)] dark:bg-slate-900 dark:border-slate-800`}
            >
              <header className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-5">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}