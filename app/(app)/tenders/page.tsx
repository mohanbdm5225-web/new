"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSearch,
  FileSignature,
  GanttChartSquare,
  IndianRupee,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { RowActions } from "@/components/shared/row-actions";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TenderForm } from "@/components/forms/tender-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Tender, TenderStatus } from "@/lib/types";
import { useTeam, useTenders } from "@/lib/use-store";
import { daysUntil, formatCompactINR, formatDate, formatINR } from "@/lib/utils";

const statusFlow: TenderStatus[] = [
  "Draft",
  "Submitted",
  "Shortlisted",
  "Won",
  "Lost",
  "Cancelled",
];

const preparationChecklist = [
  "Eligibility criteria reviewed",
  "Technical methodology drafted",
  "BOQ and commercial costing ready",
  "EMD / bank guarantee arranged",
  "Compliance documents attached",
  "Submission portal validation done",
];

const kanbanStatuses: TenderStatus[] = ["Draft", "Submitted", "Shortlisted", "Won"];

export default function TendersPage() {
  const { items: tenders, add, update, remove } = useTenders();
  const { items: team } = useTeam();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [activeTenderId, setActiveTenderId] = useState<string | null>(null);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const statuses = ["All", ...statusFlow];
  const activeTender =
    tenders.find((tender) => tender.id === activeTenderId) ?? tenders[0] ?? null;

  const stats = useMemo(() => {
    const submittedCount = tenders.filter((t) => t.status === "Submitted").length;
    const wonCount = tenders.filter((t) => t.status === "Won").length;
    const draftCount = tenders.filter((t) => t.status === "Draft").length;
    const upcomingCount = tenders.filter((t) => {
      const daysLeft = daysUntil(t.submissionDate);
      return daysLeft <= 15 && daysLeft >= 0;
    }).length;
    const totalEstimatedValue = tenders.reduce(
      (sum, tender) => sum + tender.estimatedValue,
      0
    );
    const emdExposure = tenders.reduce((sum, tender) => sum + tender.emdAmount, 0);
    const wonValue = tenders
      .filter((tender) => tender.status === "Won")
      .reduce((sum, tender) => sum + tender.estimatedValue, 0);

    return {
      submittedCount,
      wonCount,
      draftCount,
      upcomingCount,
      totalEstimatedValue,
      emdExposure,
      wonValue,
      winRatio: tenders.length ? Math.round((wonCount / tenders.length) * 100) : 0,
    };
  }, [tenders]);

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const assignedPerson = team.find((member) => member.id === tender.assignedTo);
      const matchesSearch = `${tender.title} ${tender.client} ${tender.referenceNumber} ${tender.location} ${tender.scope} ${assignedPerson?.name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = status === "All" || tender.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status, team, tenders]);

  const urgentTenders = useMemo(() => {
    return [...tenders]
      .filter((tender) => !["Won", "Lost", "Cancelled"].includes(tender.status))
      .sort((a, b) => daysUntil(a.submissionDate) - daysUntil(b.submissionDate))
      .slice(0, 4);
  }, [tenders]);

  const statusCounts = useMemo(() => {
    return statusFlow.map((item) => ({
      status: item,
      count: tenders.filter((tender) => tender.status === item).length,
      value: tenders
        .filter((tender) => tender.status === item)
        .reduce((sum, tender) => sum + tender.estimatedValue, 0),
    }));
  }, [tenders]);

  function getAssignedPerson(userId: string) {
    return team.find((member) => member.id === userId)?.name ?? "Unassigned";
  }

  function getReadiness(tender: Tender) {
    const score = [
      Boolean(tender.title),
      Boolean(tender.client),
      Boolean(tender.referenceNumber),
      tender.estimatedValue > 0,
      tender.emdAmount > 0,
      Boolean(tender.scope),
      Boolean(tender.assignedTo),
      Boolean(tender.submissionDate),
    ].filter(Boolean).length;

    return Math.round((score / 8) * 100);
  }

  function openNewTender() {
    setEditingTender(null);
    setFormOpen(true);
  }

  function openEditTender(tender: Tender) {
    setEditingTender(tender);
    setFormOpen(true);
  }

  function handleSubmit(tender: Tender) {
    if (editingTender) {
      update(tender.id, tender);
    } else {
      add(tender);
      setActiveTenderId(tender.id);
    }
    setFormOpen(false);
    setEditingTender(null);
  }

  function handleDelete(tender: Tender) {
    if (window.confirm(`Delete tender ${tender.referenceNumber || tender.title}?`)) {
      remove(tender.id);
      if (activeTenderId === tender.id) setActiveTenderId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Tender Analysis Workspace"
        description="Prepare bids, analyse tender value and risk, manage EMD exposure, and track every opportunity from draft to award."
      >
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export pipeline
        </Button>

        <Button onClick={openNewTender}>
          <Plus className="h-4 w-4" />
          Add tender
        </Button>
      </PageHeader>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Submitted"
          value={stats.submittedCount}
          icon={FileSignature}
          tone="indigo"
          hint="Bids already submitted"
          index={0}
        />
        <StatCard
          label="Won"
          value={stats.wonCount}
          icon={Trophy}
          tone="emerald"
          hint={`${formatCompactINR(stats.wonValue)} awarded value`}
          index={1}
        />
        <StatCard
          label="In Preparation"
          value={stats.draftCount}
          icon={CalendarClock}
          tone="amber"
          hint="Draft responses in progress"
          index={2}
        />
        <StatCard
          label="Urgent Deadlines"
          value={stats.upcomingCount}
          icon={AlertTriangle}
          tone="rose"
          hint="Due within 15 days"
          index={3}
        />
      </section>

      <section className="mb-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <BarChart3 className="h-4 w-4" /> Bid intelligence
              </div>
              <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Tender Pipeline Analysis
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Monitor estimated opportunity value, EMD locked in bids, stage-wise value, and win performance before committing bid-preparation effort.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                  Pipeline value
                </p>
                <p className="font-num mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-200">
                  {formatCompactINR(stats.totalEstimatedValue)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  EMD exposure
                </p>
                <p className="font-num mt-1 text-2xl font-bold text-amber-700 dark:text-amber-200">
                  {formatCompactINR(stats.emdExposure)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <AnalysisTile
              icon={Target}
              label="Win ratio"
              value={`${stats.winRatio}%`}
              helper="Awarded tenders against total tracked"
            />
            <AnalysisTile
              icon={IndianRupee}
              label="Average bid"
              value={formatCompactINR(tenders.length ? stats.totalEstimatedValue / tenders.length : 0)}
              helper="Mean estimated tender value"
            />
            <AnalysisTile
              icon={ShieldCheck}
              label="Active bids"
              value={tenders.filter((t) => ["Draft", "Submitted", "Shortlisted"].includes(t.status)).length}
              helper="Open preparation and decision items"
            />
          </div>

          <div className="mt-6 space-y-3">
            {statusCounts.map((item) => (
              <div key={item.status} className="grid gap-3 rounded-xl border border-slate-100 p-3 md:grid-cols-[120px_1fr_120px] md:items-center dark:border-slate-800">
                <div className="flex items-center justify-between md:block">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-slate-500 md:hidden">{item.count} tenders</span>
                </div>
                <ProgressBar value={stats.totalEstimatedValue ? (item.value / stats.totalEstimatedValue) * 100 : 0} />
                <div className="text-left md:text-right">
                  <p className="font-num text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCompactINR(item.value)}
                  </p>
                  <p className="text-xs text-slate-500">{item.count} tenders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-600">
                <AlertTriangle className="h-4 w-4" /> Action priority
              </div>
              <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Upcoming Submissions
              </h2>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {urgentTenders.map((tender) => {
              const daysLeft = daysUntil(tender.submissionDate);
              return (
                <button
                  key={tender.id}
                  onClick={() => setActiveTenderId(tender.id)}
                  className="w-full rounded-xl bg-slate-50 p-3 text-left transition hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {tender.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${daysLeft <= 7 ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d late` : `${daysLeft}d`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {tender.client} • Submission {formatDate(tender.submissionDate)}
                  </p>
                  <div className="mt-3">
                    <ProgressBar value={getReadiness(tender)} />
                  </div>
                </button>
              );
            })}
            {urgentTenders.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/70">
                No open tender deadlines are currently pending.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 xl:grid-cols-4">
        {kanbanStatuses.map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge status={item} />
              <span className="font-num text-sm font-semibold text-slate-500">
                {tenders.filter((tender) => tender.status === item).length}
              </span>
            </div>
            <div className="space-y-3">
              {tenders
                .filter((tender) => tender.status === item)
                .slice(0, 3)
                .map((tender) => (
                  <button
                    key={tender.id}
                    onClick={() => setActiveTenderId(tender.id)}
                    className="w-full rounded-xl border border-slate-100 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-slate-800 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {tender.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatCompactINR(tender.estimatedValue)} • {formatDate(tender.submissionDate)}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <ClipboardCheck className="h-3.5 w-3.5" /> {getReadiness(tender)}% ready
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mb-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <FileSearch className="h-4 w-4" /> Tender register
              </div>
              <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Search, Filter and Track Status
              </h2>
            </div>
            <div className="relative w-full xl:w-96">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tender, client, ref no, owner..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  status === item
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="hidden grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid dark:border-slate-800 dark:bg-slate-800/60">
              <div className="col-span-3">Tender</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Value / EMD</div>
              <div className="col-span-1">Submission</div>
              <div className="col-span-1">Owner</div>
              <div className="col-span-1">Ready</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {filteredTenders.map((tender) => {
              const daysLeft = daysUntil(tender.submissionDate);
              return (
                <div
                  key={tender.id}
                  className="grid gap-4 border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50 lg:grid-cols-12 lg:items-center dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <button className="text-left lg:col-span-3" onClick={() => setActiveTenderId(tender.id)}>
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {tender.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {tender.referenceNumber || "No reference"} • {tender.location || "No location"}
                    </p>
                  </button>
                  <div className="lg:col-span-2">
                    <p className="line-clamp-1 text-sm text-slate-700 dark:text-slate-300">
                      {tender.client || "—"}
                    </p>
                    <p className={`mt-1 text-xs font-semibold ${daysLeft <= 7 ? "text-rose-600" : "text-slate-500"}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </p>
                  </div>
                  <div className="lg:col-span-1">
                    <StatusBadge status={tender.status} />
                  </div>
                  <div className="lg:col-span-2">
                    <p className="font-num text-sm font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(tender.estimatedValue)}
                    </p>
                    <p className="font-num text-xs text-slate-500">
                      EMD: {formatINR(tender.emdAmount)}
                    </p>
                  </div>
                  <div className="lg:col-span-1">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {formatDate(tender.submissionDate)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Opens {formatDate(tender.openingDate)}
                    </p>
                  </div>
                  <div className="lg:col-span-1">
                    <p className="line-clamp-1 text-xs text-slate-600 dark:text-slate-300">
                      {getAssignedPerson(tender.assignedTo)}
                    </p>
                  </div>
                  <div className="lg:col-span-1">
                    <p className="font-num mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {getReadiness(tender)}%
                    </p>
                    <ProgressBar value={getReadiness(tender)} />
                  </div>
                  <div className="text-left lg:col-span-1 lg:text-right">
                    <RowActions onEdit={() => openEditTender(tender)} onDelete={() => handleDelete(tender)} />
                  </div>
                </div>
              );
            })}

            {filteredTenders.length === 0 && (
              <div className="p-10 text-center">
                <FileSignature className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  No tenders found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or tender status filter.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <GanttChartSquare className="h-4 w-4" /> Preparation tracker
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {activeTender ? activeTender.title : "Select a tender"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {activeTender
              ? `${activeTender.client} • ${activeTender.referenceNumber || "Reference pending"}`
              : "Choose any tender to view preparation readiness and checklist."}
          </p>

          {activeTender && (
            <div className="mt-5 space-y-5">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Bid readiness
                  </span>
                  <span className="font-num text-sm font-bold text-indigo-600">
                    {getReadiness(activeTender)}%
                  </span>
                </div>
                <ProgressBar value={getReadiness(activeTender)} />
                <p className="mt-3 text-xs text-slate-500">
                  Scope, owner, dates, EMD and commercial values are used to estimate preparation completeness.
                </p>
              </div>

              <div className="space-y-3">
                {preparationChecklist.map((item, index) => {
                  const complete = index < Math.round((getReadiness(activeTender) / 100) * preparationChecklist.length);
                  return (
                    <div key={item} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${complete ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {item}
                        </p>
                        <p className="text-xs text-slate-500">
                          {complete ? "Marked ready from tender details" : "Needs follow-up before submission"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-4 w-4" /> Suggested next action
                </div>
                <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-200">
                  {getReadiness(activeTender) < 70
                    ? "Complete missing commercial, EMD, owner and scope details before final bid review."
                    : activeTender.status === "Draft"
                    ? "Schedule internal review and move the tender to Submitted after portal upload."
                    : "Track opening date, clarifications and award status updates."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTender(null);
        }}
        title={editingTender ? "Edit tender" : "Add tender"}
        description="Capture tender details, preparation owner, financial exposure and status."
        size="lg"
      >
        <TenderForm
          initial={editingTender}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditingTender(null);
          }}
        />
      </Modal>
    </div>
  );
}

function AnalysisTile({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <Icon className="h-4 w-4 text-indigo-500" /> {label}
      </div>
      <p className="font-num mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}
