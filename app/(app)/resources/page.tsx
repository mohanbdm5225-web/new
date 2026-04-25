"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";
import { team } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { initials } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/progress-bar";

export default function ResourcesPage() {
  return (
    <div>
      <PageHeader title="Team" description="Surveyors, analysts, pilots and coordinators — their workload and focus areas.">
        <Button size="sm"><Plus className="h-4 w-4" /> Add Member</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {team.map((m) => (
          <Card key={m.id} className="p-5">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white">
                  {initials(m.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.role}</p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                <p className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5" /> {m.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {m.phone}</p>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <span>Workload</span>
                  <span className="font-num text-slate-700">{m.workload}%</span>
                </div>
                <ProgressBar
                  value={m.workload}
                  height="h-1.5"
                  color={m.workload > 80 ? "bg-rose-500" : m.workload > 60 ? "bg-amber-500" : "bg-emerald-500"}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {m.skills.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <span className="text-slate-500">{m.department}</span>
                <span className="font-num font-semibold text-slate-700">{m.activeProjects} projects</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}