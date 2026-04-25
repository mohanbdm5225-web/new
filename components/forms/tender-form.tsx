"use client";

import { useState, useEffect } from "react";
import { Tender, TenderStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/lib/use-store";
import { uid } from "@/lib/id";

const STATUSES: TenderStatus[] = ["Draft", "Submitted", "Shortlisted", "Won", "Lost", "Cancelled"];

export function TenderForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Tender | null;
  onSubmit: (tender: Tender) => void;
  onCancel: () => void;
}) {
  const { items: team } = useTeam();
  const [form, setForm] = useState<Tender>(() => initial || createEmptyTender());

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof Tender>(key: K, value: Tender[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Tender Title" required>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Client" required>
          <Input value={form.client} onChange={(e) => set("client", e.target.value)} required />
        </Field>
        <Field label="Reference Number">
          <Input value={form.referenceNumber} onChange={(e) => set("referenceNumber", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as TenderStatus)} options={STATUSES} />
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Submission Date">
          <Input type="date" value={form.submissionDate} onChange={(e) => set("submissionDate", e.target.value)} />
        </Field>
        <Field label="Opening Date">
          <Input type="date" value={form.openingDate} onChange={(e) => set("openingDate", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Estimated Value (₹)">
          <Input type="number" value={form.estimatedValue} onChange={(e) => set("estimatedValue", Number(e.target.value))} />
        </Field>
        <Field label="EMD Amount (₹)">
          <Input type="number" value={form.emdAmount} onChange={(e) => set("emdAmount", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Assigned To">
        <Select
          value={form.assignedTo}
          onChange={(e) => set("assignedTo", e.target.value)}
          options={[{ label: "— Select person —", value: "" }, ...team.map((m) => ({ label: m.name, value: m.id }))]}
        />
      </Field>

      <Field label="Scope">
        <Textarea value={form.scope} onChange={(e) => set("scope", e.target.value)} rows={3} />
      </Field>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save Changes" : "Create Tender"}</Button>
      </div>
    </form>
  );
}

function createEmptyTender(): Tender {
  return {
    id: uid("tn_"),
    title: "",
    client: "",
    referenceNumber: "",
    status: "Draft",
    submissionDate: new Date(Date.now() + 14 * 86400 * 1000).toISOString().slice(0, 10),
    openingDate: new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10),
    estimatedValue: 0,
    emdAmount: 0,
    location: "",
    scope: "",
    assignedTo: "",
  };
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}