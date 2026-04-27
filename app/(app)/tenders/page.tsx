"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Download,
  FileSignature,
  Plus,
  Search,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tenders, team } from "@/lib/mock-data";
import { daysUntil, formatCompactINR, formatDate, formatINR } from "@/lib/utils";

export default function TendersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const statuses = ["All", ...Array.from(new Set(tenders.map((t) => t.status)))];

  const submittedCount = tenders.filter((t) => t.status === "Submitted").length;
  const wonCount = tenders.filter((t) => t.status === "Won").length;
  const draftCount = tenders.filter((t) => t.status === "Draft").length;
  const upcomingCount = tenders.filter(
    (t) => daysUntil(t.submissionDate) <= 15 && daysUntil(t.submissionDate) >= 0
  ).length;

  const totalEstimatedValue = tenders.reduce(
    (sum, tender) => sum + tender.estimatedValue,
    0
  );

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const assignedPerson = team.find((member) => member.id === tender.assignedTo);

      const matchesSearch = `${tender.title} ${tender.client} ${tender.referenceNumber} ${tender.location} ${tender.scope} ${assignedPerson?.name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = status === "All" || tender.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  function getAssignedPerson(userId: string) {
    return team.find((member) => member.id === userId)?.name ?? "Unassigned";
  }

  return (
    <div>
      <PageHeader
        title="Tender Tracker"
        description="Track government tenders, private RFQs, EMD, submission dates, bid status and estimated value."
      >
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button>

        <Button>
          <Plus className="h-4 w-4" />
          Add Tender
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Submitted"
          value={submittedCount}
          icon={FileSignature}
          tone="indigo"
          hint="Bids already submitted"
          index={0}
        />

        <StatCard
          label="Won"
          value={wonCount}
          icon={Trophy}
          tone="emerald"
          hint="Awarded tenders"
          index={1}
        />

        <StatCard
          label="Draft"
          value={draftCount}
          icon={CalendarClock}
          tone="amber"
          hint="Preparation in progress"
          index={2}
        />

        <StatCard
          label="Upcoming"
          value={upcomingCount}
          icon={AlertTriangle}
          tone="rose"
          hint="Due within 15 days"
          index={3}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft lg:col-span-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Tender Pipeline Value
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Combined estimated value of all tender opportunities.
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="font-num text-3xl font-bold text-slate-900">
                {formatCompactINR(totalEstimatedValue)}
              </p>
              <p className="text-sm text-slate-500">Total estimated value</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-700">
                Active Pipeline
              </p>
              <p className="font-num mt-1 text-xl font-bold text-indigo-700">
                {tenders.length}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">
                Win Ratio
              </p>
              <p className="font-num mt-1 text-xl font-bold text-emerald-700">
                {Math.round((wonCount / tenders.length) * 100)}%
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-700">
                EMD Exposure
              </p>
              <p className="font-num mt-1 text-xl font-bold text-amber-700">
                {formatCompactINR(
                  tenders.reduce((sum, tender) => sum + tender.emdAmount, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-base font-semibold text-slate-900">
            Tender Action Priority
          </h2>

          <div className="mt-4 space-y-3">
            {tenders
              .filter((tender) => tender.status === "Draft")
              .slice(0, 3)
              .map((tender) => {
                const daysLeft = daysUntil(tender.submissionDate);

                return (
                  <div key={tender.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                      {tender.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Submission: {formatDate(tender.submissionDate)}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        daysLeft <= 7 ? "text-rose-600" : "text-amber-600"
                      }`}
                    >
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:w-96">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tender, client, ref no..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  status === item
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div className="col-span-3">Tender</div>
          <div className="col-span-2">Client</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Value / EMD</div>
          <div className="col-span-1">Submission</div>
          <div className="col-span-1">Opening</div>
          <div className="col-span-1">Owner</div>
          <div className="col-span-1 text-right">Due</div>
        </div>

        {filteredTenders.map((tender) => {
          const daysLeft = daysUntil(tender.submissionDate);

          return (
            <div
              key={tender.id}
              className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="col-span-3">
                <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {tender.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {tender.referenceNumber}
                </p>
              </div>

              <div className="col-span-2">
                <p className="line-clamp-1 text-sm text-slate-700">
                  {tender.client}
                </p>
                <p className="text-xs text-slate-500">{tender.location}</p>
              </div>

              <div className="col-span-1">
                <StatusBadge status={tender.status} />
              </div>

              <div className="col-span-2">
                <p className="font-num text-sm font-bold text-slate-900">
                  {formatINR(tender.estimatedValue)}
                </p>
                <p className="font-num text-xs text-slate-500">
                  EMD: {formatINR(tender.emdAmount)}
                </p>
              </div>

              <div className="col-span-1">
                <p className="text-xs text-slate-600">
                  {formatDate(tender.submissionDate)}
                </p>
              </div>

              <div className="col-span-1">
                <p className="text-xs text-slate-600">
                  {formatDate(tender.openingDate)}
                </p>
              </div>

              <div className="col-span-1">
                <p className="line-clamp-1 text-xs text-slate-600">
                  {getAssignedPerson(tender.assignedTo)}
                </p>
              </div>

              <div className="col-span-1 text-right">
                <p
                  className={`text-xs font-semibold ${
                    daysLeft < 0
                      ? "text-rose-600"
                      : daysLeft <= 7
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`}
                >
                  {daysLeft < 0
                    ? `${Math.abs(daysLeft)}d late`
                    : `${daysLeft}d left`}
                </p>
              </div>
            </div>
          );
        })}

        {filteredTenders.length === 0 && (
          <div className="p-10 text-center">
            <FileSignature className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              No tenders found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or tender status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}