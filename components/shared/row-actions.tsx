"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.10)] dark:bg-slate-900 dark:border-slate-800">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}