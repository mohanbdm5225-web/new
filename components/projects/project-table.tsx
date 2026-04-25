"use client";

import { Project } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { formatCompactINR, formatDate, initials } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getMemberById } from "@/lib/mock-data";

export function ProjectTable({
  projects,
  onRowClick,
}: {
  projects: Project[];
  onRowClick: (p: Project) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/60">
            <tr>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Progress</th>
              <th className="px-4 py-3 text-left">Budget</th>
              <th className="px-4 py-3 text-left">Due</th>
              <th className="px-4 py-3 text-left">Manager</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const mgr = getMemberById(p.managerId);
              return (
                <tr key={p.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <Link href={`/projects/${p.id}`} className="font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100">
                      {p.name}
                    </Link>
                    <p className="font-num text-[11px] text-slate-500">{p.code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{p.client}</td>
                  <td className="px-4 py-3 text-slate-600">{p.type}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={p.progress} className="w-28" height="h-1.5" />
                      <span className="font-num text-xs font-semibold text-slate-700">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-num text-slate-900 dark:text-slate-100">{formatCompactINR(p.budget)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(p.endDate)}</td>
                  <td className="px-4 py-3">
                    {mgr && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-[10px] font-bold text-white">
                          {initials(mgr.name)}
                        </div>
                        <span className="text-xs text-slate-600">{mgr.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onRowClick(p)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}