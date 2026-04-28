"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FolderKanban,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

interface ProjectPackagesPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const packages = [
  {
    id: "pkg-a",
    name: "Survey Package A",
    status: "Pending",
    progress: 56,
    dueDate: "2026-05-15",
    owner: "Survey Team",
  },
  {
    id: "pkg-b",
    name: "Construction Monitoring",
    status: "In Progress",
    progress: 74,
    dueDate: "2026-06-10",
    owner: "Site Monitoring",
  },
  {
    id: "pkg-c",
    name: "Quality Assurance",
    status: "Completed",
    progress: 100,
    dueDate: "2026-04-28",
    owner: "QA Team",
  },
];

const statuses = ["All", "Pending", "In Progress", "Completed"];

function downloadPackageCsv(items: typeof packages) {
  const rows = [
    ["Package ID", "Name", "Status", "Progress", "Due Date", "Owner"],
    ...items.map((item) => [item.id, item.name, item.status, `${item.progress}%`, item.dueDate, item.owner]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "package-summary.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function ProjectPackagesPage({ params }: ProjectPackagesPageProps) {
  const { projectId } = use(params);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredPackages = useMemo(
    () =>
      packages.filter((item) => {
        const matchesSearch = [item.name, item.owner, item.id]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus = status === "All" || item.status === status;
        return matchesSearch && matchesStatus;
      }),
    [search, status]
  );

  const completedCount = packages.filter((item) => item.status === "Completed").length;
  const inProgressCount = packages.filter((item) => item.status === "In Progress").length;
  const pendingCount = packages.filter((item) => item.status === "Pending").length;

  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={projectId.replace(/-/g, " ")}
        description="Package-level tracking with status, health, and export options."
      >
        <button
          type="button"
          onClick={() => downloadPackageCsv(filteredPackages)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Download className="h-4 w-4" />
          Export packages
        </button>
      </PageHeader>

      <section className="grid gap-4 xl:grid-cols-3">
        <StatCard
          label="Total packages"
          value={packages.length}
          icon={FolderKanban}
          tone="indigo"
          hint="Package scope across the project"
          index={0}
        />
        <StatCard
          label="In progress"
          value={inProgressCount}
          icon={Clock}
          tone="amber"
          hint="Work currently active"
          index={1}
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          tone="emerald"
          hint="Packages ready for review"
          index={2}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search packages or owners"
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

      <section className="grid gap-4 lg:grid-cols-3">
        {filteredPackages.map((packageItem) => (
          <article
            key={packageItem.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{packageItem.id}</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-900">{packageItem.name}</h4>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  packageItem.status === "Completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : packageItem.status === "In Progress"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {packageItem.status}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Owner: {packageItem.owner}</p>
              <p>Due date: {packageItem.dueDate}</p>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900" style={{ width: `${packageItem.progress}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-500">Progress: {packageItem.progress}%</p>

            <Link
              href={`/projects/nhai/${projectId}/packages/${packageItem.id}`}
              className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              View package
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
