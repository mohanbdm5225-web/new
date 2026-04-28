"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

interface ChainagePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const chainageSegments = [
  { id: "seg-01", label: "Segment 01", length: "8.4 km", status: "Surveyed", completion: 92 },
  { id: "seg-02", label: "Segment 02", length: "6.2 km", status: "Pending", completion: 18 },
  { id: "seg-03", label: "Segment 03", length: "10.1 km", status: "In Progress", completion: 61 },
  { id: "seg-04", label: "Segment 04", length: "4.9 km", status: "At risk", completion: 34 },
];

const statuses = ["All", "Surveyed", "Pending", "In Progress", "At risk"];

export default function ChainagePage({ params }: ChainagePageProps) {
  const { projectId } = use(params);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredSegments = useMemo(
    () =>
      chainageSegments.filter((segment) => {
        const matchesSearch = [segment.label, segment.status]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus = status === "All" || segment.status === status;
        return matchesSearch && matchesStatus;
      }),
    [search, status]
  );

  const inProgressCount = chainageSegments.filter((segment) => segment.status === "In Progress").length;
  const atRiskCount = chainageSegments.filter((segment) => segment.status === "At risk").length;
  const surveyedCount = chainageSegments.filter((segment) => segment.status === "Surveyed").length;

  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={`Chainage for ${projectId.replace(/-/g, " ")}`}
        description="Search, filter and track chainage segments with quick visibility into risk and completion status."
      >
        <Link
          href={`/projects/nhai/${projectId}/chainage/seg-01`}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Open segment details
        </Link>
      </PageHeader>

      <section className="grid gap-4 xl:grid-cols-3">
        <StatCard
          label="Surveyed"
          value={surveyedCount}
          icon={ShieldCheck}
          tone="emerald"
          hint="Segments fully surveyed"
          index={0}
        />
        <StatCard
          label="In progress"
          value={inProgressCount}
          icon={MapPin}
          tone="amber"
          hint="Segments currently active"
          index={1}
        />
        <StatCard
          label="At risk"
          value={atRiskCount}
          icon={AlertTriangle}
          tone="rose"
          hint="Segments needing attention"
          index={2}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search segments"
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

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">Map view</h3>
          <div className="mt-5 h-72 rounded-3xl bg-slate-200" />
          <p className="mt-4 text-sm text-slate-500">This placeholder shows where the chainage route and segment markers will be displayed.</p>
        </div>

        <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900">Chainage segments</h3>
          <div className="mt-5 space-y-4">
            {filteredSegments.map((segment) => (
              <div key={segment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{segment.label}</p>
                    <h4 className="mt-2 text-xl font-semibold text-slate-900">{segment.length}</h4>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      segment.status === "Surveyed"
                        ? "bg-emerald-100 text-emerald-700"
                        : segment.status === "Pending"
                        ? "bg-slate-100 text-slate-700"
                        : segment.status === "In Progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {segment.status}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${segment.completion}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <p>{segment.completion}% completed</p>
                  <Link
                    href={`/projects/nhai/${projectId}/chainage/${segment.id}`}
                    className="inline-flex rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Open segment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
