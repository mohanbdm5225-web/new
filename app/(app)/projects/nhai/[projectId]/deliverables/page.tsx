"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Download, FolderKanban, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

interface DeliverablesPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const deliverables = [
  {
    id: "item-21",
    title: "Survey report package",
    status: "Submitted",
    dueDate: "2026-05-04",
  },
  {
    id: "item-22",
    title: "Material approval matrix",
    status: "Under review",
    dueDate: "2026-05-12",
  },
  {
    id: "item-23",
    title: "Safety compliance checklist",
    status: "Completed",
    dueDate: "2026-04-18",
  },
];

const statuses = ["All", "Submitted", "Under review", "Completed"];

export default function DeliverablesPage({ params }: DeliverablesPageProps) {
  const { projectId } = use(params);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredDeliverables = useMemo(
    () =>
      deliverables.filter((item) => {
        const matchesSearch = [item.title, item.id, item.status]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus = status === "All" || item.status === status;
        return matchesSearch && matchesStatus;
      }),
    [search, status]
  );

  const completedCount = deliverables.filter((item) => item.status === "Completed").length;
  const underReviewCount = deliverables.filter((item) => item.status === "Under review").length;
  const dueSoonCount = deliverables.filter((item) => item.status === "Submitted").length;

  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={`Deliverables for ${projectId.replace(/-/g, " ")}`}
        description="Track deliverable progress, pending approvals, and documents in one place."
      >
        <button
          type="button"
          onClick={() => {
            const rows = [
              ["Deliverable ID", "Title", "Status", "Due Date"],
              ...filteredDeliverables.map((item) => [item.id, item.title, item.status, item.dueDate]),
            ];
            const csv = rows
              .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
              .join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "deliverables.csv";
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Download className="h-4 w-4" />
          Export deliverables
        </button>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          tone="emerald"
          hint="Approved deliverables"
          index={0}
        />
        <StatCard
          label="Under review"
          value={underReviewCount}
          icon={AlertTriangle}
          tone="amber"
          hint="Pending approval"
          index={1}
        />
        <StatCard
          label="Submitted"
          value={dueSoonCount}
          icon={FolderKanban}
          tone="indigo"
          hint="Awaiting feedback"
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
              placeholder="Search deliverables"
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredDeliverables.map((item) => (
          <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.id}</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-900">{item.title}</h4>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  item.status === "Completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : item.status === "Under review"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-600">Due date: {item.dueDate}</p>
            <Link
              href={`/projects/nhai/${projectId}/deliverables/${item.id}`}
              className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              View deliverable
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
