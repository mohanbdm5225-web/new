"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  IndianRupee,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ProjectProfitability } from "@/components/projects/project-profitability";
import {
  activity,
  documents,
  finance,
  getMemberById,
  getProjectById,
  getTasksByProject,
} from "@/lib/mock-data";
import {
  cn,
  daysUntil,
  formatBytes,
  formatDate,
  formatINR,
  initials,
  timeAgo,
} from "@/lib/utils";

const tabs = [
  "Overview",
  "Tasks",
  "Team",
  "Documents",
  "Finance",
  "Profitability",
  "Timeline",
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = String(params.id);
  const project = getProjectById(projectId);
  const [activeTab, setActiveTab] = useState("Overview");

  if (!project) {
    notFound();
  }

  const projectTasks = getTasksByProject(project.id);
  const projectDocuments = documents.filter((doc) => doc.projectId === project.id);
  const projectFinance = finance.filter((item) => item.projectId === project.id);
  const projectActivity = activity.filter((item) => item.entityId === project.id);
  const manager = getMemberById(project.managerId);
  const projectTeam = project.teamIds
    .map((id) => getMemberById(id))
    .filter(Boolean);

  const completedTasks = projectTasks.filter((task) => task.status === "Done").length;
  const overdueTasks = projectTasks.filter(
    (task) => daysUntil(task.dueDate) < 0 && task.status !== "Done"
  ).length;

  const income = projectFinance
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = projectFinance
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const profit = income - expense;

  const dueDays = daysUntil(project.endDate);

  const tabContent = useMemo(() => {
    if (activeTab === "Overview") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-base font-semibold text-slate-900">
                Project Description
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {project.description}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="Client" value={project.client} />
                <InfoItem label="Project Code" value={project.code} />
                <InfoItem label="Project Type" value={project.type} />
                <InfoItem label="Location" value={project.location} />
                <InfoItem label="Start Date" value={formatDate(project.startDate)} />
                <InfoItem label="End Date" value={formatDate(project.endDate)} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-base font-semibold text-slate-900">
                Work Progress
              </h2>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Overall Completion
                  </span>
                  <span className="font-num text-sm font-bold text-slate-900">
                    {project.progress}%
                  </span>
                </div>

                <ProgressBar value={project.progress} height="h-3" />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <SummaryBox title="Total Tasks" value={projectTasks.length} />
                <SummaryBox title="Completed" value={completedTasks} success />
                <SummaryBox title="Overdue" value={overdueTasks} danger />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-base font-semibold text-slate-900">
                Project Manager
              </h2>

              {manager && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-bold text-indigo-700">
                    {initials(manager.name)}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">{manager.name}</p>
                    <p className="text-sm text-slate-500">{manager.role}</p>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-base font-semibold text-slate-900">
                Budget Status
              </h2>

              <div className="mt-4 space-y-4">
                <FinanceLine label="Budget" value={formatINR(project.budget)} />
                <FinanceLine label="Spent" value={formatINR(project.spent)} />
                <FinanceLine
                  label="Balance"
                  value={formatINR(project.budget - project.spent)}
                />
              </div>
            </section>
          </aside>
        </div>
      );
    }

    if (activeTab === "Tasks") {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
          {projectTasks.map((task) => {
            const taskDueDays = daysUntil(task.dueDate);
            const isOverdue = taskDueDays < 0 && task.status !== "Done";
            const assignee = getMemberById(task.assigneeId);

            return (
              <div
                key={task.id}
                className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-0 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {task.title}
                    </h3>
                    <StatusBadge status={task.status} />
                    <StatusBadge status={task.priority} />
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {task.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>Assignee: {assignee?.name ?? "Unassigned"}</span>
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>
                </div>

                <div
                  className={cn(
                    "text-sm font-semibold",
                    isOverdue
                      ? "text-rose-600"
                      : taskDueDays <= 5
                      ? "text-amber-600"
                      : "text-slate-500"
                  )}
                >
                  {task.status === "Done"
                    ? "Completed"
                    : isOverdue
                    ? `${Math.abs(taskDueDays)} days late`
                    : `${taskDueDays} days left`}
                </div>
              </div>
            );
          })}

          {projectTasks.length === 0 && (
            <EmptyDetail title="No tasks found for this project" />
          )}
        </div>
      );
    }

    if (activeTab === "Team") {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projectTeam.map((member) => {
            if (!member) return null;

            return (
              <div
                key={member.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-bold text-indigo-700">
                    {initials(member.name)}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {member.name}
                    </h3>
                    <p className="text-sm text-slate-500">{member.role}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-500">Workload</span>
                    <span className="font-num font-semibold">
                      {member.workload}%
                    </span>
                  </div>

                  <ProgressBar value={member.workload} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === "Documents") {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
          {projectDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border-b border-slate-100 p-5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {doc.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {doc.category} • {formatBytes(doc.size)} • Uploaded{" "}
                    {timeAgo(doc.uploadedAt)}
                  </p>
                </div>
              </div>

              <StatusBadge status={doc.fileType.toUpperCase()} />
            </div>
          ))}

          {projectDocuments.length === 0 && (
            <EmptyDetail title="No documents uploaded for this project" />
          )}
        </div>
      );
    }

    if (activeTab === "Finance") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryBox title="Income" value={formatINR(income)} success />
            <SummaryBox title="Expense" value={formatINR(expense)} danger />
            <SummaryBox title="Profit" value={formatINR(profit)} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
            {projectFinance.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center border-b border-slate-100 p-5 last:border-0"
              >
                <div className="col-span-5">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.description}
                  </p>
                  <p className="text-xs text-slate-500">{item.category}</p>
                </div>

                <div className="col-span-2">
                  <StatusBadge status={item.type} />
                </div>

                <div className="col-span-2">
                  <StatusBadge status={item.status} />
                </div>

                <div className="col-span-2">
                  <p
                    className={cn(
                      "font-num text-sm font-bold",
                      item.type === "Income"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    )}
                  >
                    {item.type === "Income" ? "+" : "-"}
                    {formatINR(item.amount)}
                  </p>
                </div>

                <div className="col-span-1 text-right text-xs text-slate-500">
                  {formatDate(item.date)}
                </div>
              </div>
            ))}

            {projectFinance.length === 0 && (
              <EmptyDetail title="No finance records for this project" />
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "Profitability") {
      return <ProjectProfitability project={project} />;
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        {projectActivity.map((item) => (
          <div
            key={item.id}
            className="relative border-l border-slate-200 pb-6 pl-5 last:pb-0"
          >
            <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-indigo-600" />

            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            <p className="mt-1 text-xs text-slate-400">
              {timeAgo(item.timestamp)}
            </p>
          </div>
        ))}

        {projectActivity.length === 0 && (
          <EmptyDetail title="No timeline activity for this project" />
        )}
      </div>
    );
  }, [
    activeTab,
    completedTasks,
    expense,
    income,
    manager,
    overdueTasks,
    profit,
    project,
    projectActivity,
    projectDocuments,
    projectFinance,
    projectTasks,
    projectTeam,
  ]);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
      />

      <PageHeader title={project.name} description={project.description}>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={project.status} />
              <StatusBadge status={project.priority} />
              <StatusBadge status={project.type} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <HeaderMetric
                icon={MapPin}
                label="Location"
                value={project.location}
              />
              <HeaderMetric
                icon={CalendarDays}
                label="Deadline"
                value={formatDate(project.endDate)}
              />
              <HeaderMetric
                icon={Clock}
                label="Days Left"
                value={dueDays < 0 ? `${Math.abs(dueDays)}d late` : `${dueDays}d`}
              />
              <HeaderMetric
                icon={IndianRupee}
                label="Budget"
                value={formatINR(project.budget)}
              />
            </div>
          </div>

          <div className="min-w-[260px]">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-500">Project Progress</span>
              <span className="font-num font-bold text-slate-900">
                {project.progress}%
              </span>
            </div>

            <ProgressBar value={project.progress} height="h-3" />
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickCard icon={FolderKanban} label="Total Tasks" value={projectTasks.length} />
        <QuickCard icon={CheckCircle2} label="Completed" value={completedTasks} />
        <QuickCard icon={Users} label="Team Members" value={projectTeam.length} />
        <QuickCard icon={Wallet} label="Profit" value={formatINR(profit)} />
      </div>

      <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {tabContent}
    </div>
  );
}

function HeaderMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="line-clamp-1 text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function QuickCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon className="h-5 w-5 text-indigo-600" />
      </div>

      <p className="font-num mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryBox({
  title,
  value,
  danger,
  success,
}: {
  title: string;
  value: string | number;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4",
        danger
          ? "bg-rose-50"
          : success
          ? "bg-emerald-50"
          : "bg-indigo-50"
      )}
    >
      <p
        className={cn(
          "text-sm font-semibold",
          danger
            ? "text-rose-700"
            : success
            ? "text-emerald-700"
            : "text-indigo-700"
        )}
      >
        {title}
      </p>

      <p
        className={cn(
          "font-num mt-1 text-xl font-bold",
          danger
            ? "text-rose-700"
            : success
            ? "text-emerald-700"
            : "text-indigo-700"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FinanceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-num text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function EmptyDetail({ title }: { title: string }) {
  return (
    <div className="p-10 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">
        Data can be connected when backend/database is added.
      </p>
    </div>
  );
}