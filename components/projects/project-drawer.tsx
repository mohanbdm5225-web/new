"use client";

import { Drawer } from "@/components/shared/drawer";
import { Project } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { formatCompactINR, formatDate, initials } from "@/lib/utils";
import { getMemberById, getTasksByProject } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Calendar, Wallet, ExternalLink } from "lucide-react";

export function ProjectDrawer({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const mgr = project ? getMemberById(project.managerId) : null;
  const tasks = project ? getTasksByProject(project.id) : [];
  const team = project ? project.teamIds.map((id) => getMemberById(id)).filter(Boolean) : [];

  return (
    <Drawer open={!!project} onClose={onClose} title={project?.name || ""}>
      {project && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} />
            <StatusBadge status={project.priority} />
            <span className="font-num text-xs text-slate-500">{project.code}</span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400">{project.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={project.location} />
            <InfoTile icon={<Calendar className="h-3.5 w-3.5" />} label="Timeline" value={`${formatDate(project.startDate)} → ${formatDate(project.endDate)}`} />
            <InfoTile icon={<Wallet className="h-3.5 w-3.5" />} label="Budget" value={formatCompactINR(project.budget)} />
            <InfoTile icon={<Wallet className="h-3.5 w-3.5" />} label="Spent" value={formatCompactINR(project.spent)} />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Overall progress</span>
              <span className="font-num font-semibold">{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Team ({team.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {mgr && <TeamChip name={mgr.name} role="Manager" />}
              {team.map(
                (m) =>
                  m &&
                  m.id !== project.managerId && (
                    <TeamChip key={m.id} name={m.name} role={m.role} />
                  )
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tasks ({tasks.length})
            </p>
            <div className="space-y-2">
              {tasks.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800 dark:text-slate-200">{t.title}</p>
                    <p className="text-xs text-slate-500">Due {formatDate(t.dueDate)}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-slate-500">No tasks yet.</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Link href={`/projects/${project.id}`} className="flex-1">
              <Button className="w-full">
                Open full page <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:bg-slate-900 dark:border-slate-800">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {icon} {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function TeamChip({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-[10px] font-bold text-white">
        {initials(name)}
      </div>
      <div className="pr-1">
        <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">{name}</p>
        <p className="text-[10px] leading-tight text-slate-500">{role}</p>
      </div>
    </div>
  );
}