"use client";

import { useState, useEffect } from "react";
import { FinanceRecord, FinanceCategory, FinanceType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/use-store";
import { uid } from "@/lib/id";

const TYPES: FinanceType[] = ["Income", "Expense"];
const CATEGORIES: FinanceCategory[] = ["Project Payment", "Equipment", "Travel", "Salary", "Software", "Office", "Other"];
const STATUSES = ["Paid", "Pending", "Overdue"] as const;

export function FinanceForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: FinanceRecord | null;
  onSubmit: (record: FinanceRecord) => void;
  onCancel: () => void;
}) {
  const { items: projects } = useProjects();
  const [form, setForm] = useState<FinanceRecord>(() => initial || createEmpty());

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof FinanceRecord>(key: K, value: FinanceRecord[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Type">
          <Select value={form.type} onChange={(e) => set("type", e.target.value as FinanceType)} options={TYPES} />
        </Field>
        <Field label="Category">
          <Select value={form.category} onChange={(e) => set("category", e.target.value as FinanceCategory)} options={CATEGORIES} />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) => set("status", e.target.value as FinanceRecord["status"])}
            options={STATUSES as unknown as string[]}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Date">
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Amount (₹)" required>
          <Input type="number" value={form.amount} onChange={(e) => set("amount", Number(e.target.value))} required />
        </Field>
      </div>

      <Field label="Project (optional)">
        <Select
          value={form.projectId || ""}
          onChange={(e) => set("projectId", e.target.value || null)}
          options={[{ label: "— No project —", value: "" }, ...projects.map((p) => ({ label: p.name, value: p.id }))]}
        />
      </Field>

      <Field label="Description" required>
        <Input value={form.description} onChange={(e) => set("description", e.target.value)} required />
      </Field>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save Changes" : "Add Entry"}</Button>
      </div>
    </form>
  );
}

function createEmpty(): FinanceRecord {
  return {
    id: uid("f_"),
    date: new Date().toISOString().slice(0, 10),
    type: "Expense",
    category: "Other",
    amount: 0,
    description: "",
    projectId: null,
    status: "Paid",
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