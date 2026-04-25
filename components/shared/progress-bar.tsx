import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  color = "bg-indigo-600",
  height = "h-2",
}: {
  value: number;
  className?: string;
  color?: string;
  height?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        height,
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}