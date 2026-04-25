"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, FileSignature, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { tenders } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { formatCompactINR, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

export default function TendersPage() {
  const total = tenders.length;
  const won = tenders.filter((t) => t.status === "Won").length;
  const lost = tenders.filter((t) => t.status === "Lost").length;
  const pending = tenders.filter((t) => t.status === "Submitted" || t.status === "Shortlisted").length;
  const totalValue = tenders.filter((t) => t.status === "Won").reduce((s, t) => s + t.estimatedValue, 0);

  return (
    <div>
      <PageHeader title="Tenders" description="All active bids, submissions, shortlists and outcomes.">
        <Button size="sm"><Plus className="h-4 w-4" /> New Tender</Button>
      </PageHeader>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Tenders" value={total} icon={FileSignature} index={0} />
        <StatCard label="Won" value={won} icon={CheckCircle2} tone="emerald" hint={formatCompactINR(totalValue)} index={1} />
        <StatCard label="Lost" value={lost} icon={XCircle} tone="rose" index={2} />
        <StatCard label="In Process" value={pending} icon={Hourglass} tone="amber" index={3} />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {tenders.map((t) => (
          <Card key={t.id} className="p-5 transition-shadow hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)]">
            <CardContent className="p-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-num text-[11px] font-semibold text-slate-500">{t.referenceNumber}</p>
                  <h3 className="mt-1 text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">{t.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{t.client} · {t.location}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{t.scope}</p>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Mini label="Estimated" value={formatCompactINR(t.estimatedValue)} />
                <Mini label="EMD" value={formatCompactINR(t.emdAmount)} />
                <Mini label="Opens" value={formatDate(t.openingDate)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-num text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}