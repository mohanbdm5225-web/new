"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, FileSignature, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { formatCompactINR, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Modal } from "@/components/ui/modal";
import { TenderForm } from "@/components/forms/tender-form";
import { useTenders } from "@/lib/use-store";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/shared/row-actions";
import { Tender } from "@/lib/types";

export default function TendersPage() {
  const { items: tenders, add, update, remove } = useTenders();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tender | null>(null);

  const total = tenders.length;
  const won = tenders.filter((t) => t.status === "Won").length;
  const lost = tenders.filter((t) => t.status === "Lost").length;
  const pending = tenders.filter((t) => t.status === "Submitted" || t.status === "Shortlisted").length;
  const totalValue = tenders.filter((t) => t.status === "Won").reduce((s, t) => s + t.estimatedValue, 0);

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (t: Tender) => { setEditing(t); setShowForm(true); };

  const handleSubmit = (tender: Tender) => {
    if (editing) {
      update(tender.id, tender);
      toast.success("Tender updated", tender.title);
    } else {
      add(tender);
      toast.success("Tender created", tender.title);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (t: Tender) => {
    const ok = await confirm({
      title: "Delete this tender?",
      description: `"${t.title}" will be permanently removed.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) {
      remove(t.id);
      toast.success("Tender deleted");
    }
  };

  return (
    <div>
      <PageHeader title="Tenders" description="All active bids, submissions, shortlists and outcomes.">
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New Tender</Button>
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
                <div className="min-w-0">
                  <p className="font-num text-[11px] font-semibold text-slate-500">{t.referenceNumber}</p>
                  <h3 className="mt-1 text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">{t.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{t.client} · {t.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  <StatusBadge status={t.status} />
                  <RowActions onEdit={() => openEdit(t)} onDelete={() => handleDelete(t)} />
                </div>
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

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? "Edit Tender" : "Create New Tender"}
        size="lg"
      >
        <TenderForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
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