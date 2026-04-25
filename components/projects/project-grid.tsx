"use client";

import { Project } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { formatCompactINR, formatDate, initials } from "@/lib/utils";
import { getMemberById } from "@/lib/mock-data";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";

export function ProjectGrid({
  projects,
  onCardClick,
}: {
  projects: Project[];
  onCardClick: (p: Project) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((p, i) => {
        const mgr = getMemberById(p.managerId);
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)] dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-num text-[11px] font-semibold text-slate-400">{p.code}</p>
                <Link href={`/projects/${p.id}`} className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100">
                  {p.name}
                </Link>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <p className="text-xs text-slate-500">
              {p.client} · <span className="text-slate-700">{p.type}</span>
            </p>

            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {p.location.split(",")[0]}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {formatDate(p.endDate)}
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">Progress</span>
                <span className="font-num font-semibold text-slate-700">{p.progress}%</span>
              </div>
              <ProgressBar value={p.progress} height="h-1.5" />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {mgr && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-[10px] font-bold text-white">
                    {initials(mgr.name)}
                  </div>
                )}
                <span className="text-xs text-slate-500">{mgr?.name}</span>
              </div>
              <div className="text-right">
                <p className="font-num text-xs font-semibold text-slate-900 dark:text-slate-100">{formatCompactINR(p.budget)}</p>
                <button onClick={() => onCardClick(p)} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700">
                  Quick view →
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}