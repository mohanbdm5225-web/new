"use client";

import { useParams } from "next/navigation";
import { getMemberById, getTasksByProject, projects } from "@/lib/mock-data";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactINR, formatDate, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Wallet, Users, Plus, FileText } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:bg-slate-900 dark:border-slate-800">
        <p className="font-semibold">Project not found</p>
        <Link href="/projects" className="text-sm text-indigo-600 hover:text-indigo-700">← Back to projects</Link>
      </div>
    );
  }

  const tasks = getTasksByProject(project.id);
  const manager = getMemberById(project.managerId);
  const team = project.teamIds.map((id) => getMemberById(id)).filter(Boolean);
  const spentPercent = Math.round((project.spent / project.budget) * 100);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: project.name }]} />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-num text-xs font-semibold text-slate-500">{project.code}</span>
            <StatusBadge status={project.status} />
            <StatusBadge status={project.priority} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{project.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {project.client} · {project.type} · {project.location}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><FileText className="h-4 w-4" /> Report</Button>
          <Button size="sm"><Plus className="h-4 w-4" /> Add Task</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-slate-600 dark:text-slate-400">{project.description}</p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <InfoTile icon={<Calendar className="h-3.5 w-3.5" />} label="Start" value={formatDate(project.startDate)} />
              <InfoTile icon={<Calendar className="h-3.5 w-3.5" />} label="End" value={formatDate(project.endDate)} />
              <InfoTile icon={<Wallet className="h-3.5 w-3.5" />} label="Budget" value={formatCompactINR(project.budget)} />
              <InfoTile icon={<Wallet className="h-3.5 w-3.5" />} label="Spent" value={formatCompactINR(project.spent)} />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-slate-600">Progress</span>
                <span className="font-num font-semibold">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-slate-600">Budget utilization</span>
                <span className="font-num font-semibold">{spentPercent}%</span>
              </div>
              <ProgressBar value={spentPercent} color={spentPercent > 85 ? "bg-rose-500" : "bg-emerald-500"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {manager && <MemberRow member={manager} badge="Manager" />}
            {team.filter((m) => m && m.id !== project.managerId).map((m) => m && <MemberRow key={m.id} member={m} />)}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Tasks ({tasks.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {tasks.map((t) => {
            const a = getMemberById(t.assigneeId);
            return (
              <div key={t.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
                  <p className="text-xs text-slate-500">{a?.name} · Due {formatDate(t.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No tasks in this project yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:bg-slate-900 dark:border-slate-800">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{icon} {label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function MemberRow({ member, badge }: { member: { name: string; role: string }; badge?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">
          {initials(member.name)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
          <p className="text-xs text-slate-500">{member.role}</p>
        </div>
      </div>
      {badge && (
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">{badge}</span>
      )}
    </div>
  );
}