import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}