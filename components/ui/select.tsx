"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { label: string; value: string }[] | readonly string[];
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, options, ...props }, ref) {
    const normalized = options.map((o) =>
      typeof o === "string" ? { label: o, value: o } : o
    );
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100",
          className
        )}
        {...props}
      >
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
);