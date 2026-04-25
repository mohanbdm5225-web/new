"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTeam } from "@/lib/use-store";
import { ProgressBar } from "@/components/shared/progress-bar";
import { initials } from "@/lib/utils";

export function TeamWorkload() {
  const { items: team } = useTeam();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Workload</CardTitle>
        <CardDescription>Current utilization by member</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {team.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No team members yet.</p>}
        {team.slice(0, 6).map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">
              {initials(m.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{m.name}</p>
                <span className="font-num text-xs font-semibold text-slate-600">{m.workload}%</span>
              </div>
              <p className="truncate text-xs text-slate-500">{m.role}</p>
              <ProgressBar
                value={m.workload}
                className="mt-1.5"
                color={m.workload > 80 ? "bg-rose-500" : m.workload > 60 ? "bg-amber-500" : "bg-emerald-500"}
                height="h-1.5"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}