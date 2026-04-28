"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus, Activity, CalendarDays, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

interface DailyUpdatesPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const updates = [
  {
    id: "update-101",
    title: "Survey complete for segment 1",
    date: "2026-04-22",
    status: "Done",
  },
  {
    id: "update-102",
    title: "Bridge clearance inspection",
    date: "2026-04-24",
    status: "On schedule",
  },
  {
    id: "update-103",
    title: "Utility coordination meeting",
    date: "2026-04-26",
    status: "Delayed",
  },
];

const statuses = ["All", "Done", "On schedule", "Delayed"];

export default function DailyUpdatesPage({ params }: DailyUpdatesPageProps) {
  const { projectId } = use(params);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredUpdates = useMemo(
    () =>
      updates.filter((item) => {
        const matchesSearch = [item.title, item.date, item.status]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus = status === "All" || item.status === status;

        return matchesSearch && matchesStatus;
      }),
    [search, status]
  );

  const doneCount = updates.filter((item) => item.status === "Done").length;
  const onScheduleCount = updates.filter((item) => item.status === "On schedule").length;
  const delayedCount = updates.filter((item) => item.status === "Delayed").length;

  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={`Daily updates for ${projectId.replace(/-/g, " ")}`}
        description="Timelines, status and quick actions for project daily logs."
      >
        <Link
          href={`/projects/nhai/${projectId}/daily-updates/new`}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          New update
        </Link>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Updates completed"
          value={doneCount}
          icon={Activity}
          tone="emerald"
          hint="Recent completed updates"
          index={0}
        />
        <StatCard
          label="On schedule"
          value={onScheduleCount}
          icon={CalendarDays}
          tone="indigo"
          hint="Updates meeting status"
          index={1}
        />
        <StatCard
          label="Delayed"
          value={delayedCount}
          icon={AlertTriangle}
          tone="rose"
          hint="Updates needing attention"
          index={2}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search updates"
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4">
        {filteredUpdates.map((update) => (
          <article key={update.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{update.date}</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-900">{update.title}</h4>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  update.status === "Done"
                    ? "bg-emerald-100 text-emerald-700"
                    : update.status === "On schedule"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {update.status}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/projects/nhai/${projectId}/daily-updates/${update.id}`}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                View update
              </Link>
              <p className="text-sm text-slate-500">Tap to see observations, issues and action items.</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
