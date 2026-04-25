import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/50",
        className
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:bg-slate-800">
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}