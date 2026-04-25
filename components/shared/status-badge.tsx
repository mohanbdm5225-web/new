import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "blue"
  | "indigo"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "slate";

const toneClass: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function getTone(status: string): Tone {
  const s = status.toLowerCase();
  if (["active", "in progress", "submitted"].includes(s)) return "blue";
  if (["completed", "done", "won", "paid"].includes(s)) return "green";
  if (["planning", "to do", "draft", "backlog"].includes(s)) return "slate";
  if (["on hold", "pending", "shortlisted", "review"].includes(s)) return "amber";
  if (["cancelled", "lost", "overdue"].includes(s)) return "red";
  if (["high", "critical", "urgent"].includes(s)) return "red";
  if (s === "medium") return "amber";
  if (s === "low") return "slate";
  return "neutral";
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = getTone(status);
  return (
    <Badge className={cn(toneClass[tone], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </Badge>
  );
}