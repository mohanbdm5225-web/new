"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "indigo",
  hint,
  index = 0,
}: {
  label: string;
  value: string | number;
  delta?: number;
  icon: LucideIcon;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "slate";
  hint?: string;
  index?: number;
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)] transition-shadow dark:bg-slate-900 dark:border-slate-800"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="font-num text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </h3>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold",
              delta >= 0 ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </motion.div>
  );
}