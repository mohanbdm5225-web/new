"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { projects, tasks } from "@/lib/mock-data";
import { daysUntil, formatDate } from "@/lib/utils";
import { AlertTriangle, Clock } from "lucide-react";

export function DeadlineAlerts() {
  const upcoming = [
    ...tasks
      .filter((t) => t.status !== "Done")
      .map((t) => ({ id: t.id, title: t.title, date: t.dueDate, kind: "Task", days: daysUntil(t.dueDate) })),
    ...projects
      .filter((p) => p.status !== "Completed" && p.status !== "Cancelled")
      .map((p) => ({ id: p.id, title: p.name, date: p.endDate, kind: "Project", days: daysUntil(p.endDate) })),
  ]
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Deadline Alerts
        </CardTitle>
        <CardDescription>Most urgent items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {upcoming.map((u) => {
          const overdue = u.days < 0;
          const soon = u.days >= 0 && u.days <= 7;
          return (
            <div
              key={`${u.kind}-${u.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-slate-100">{u.title}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" /> {formatDate(u.date)} · {u.kind}
                </p>
              </div>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  overdue
                    ? "bg-rose-50 text-rose-700"
                    : soon
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {overdue ? `${Math.abs(u.days)}d overdue` : `${u.days}d left`}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}