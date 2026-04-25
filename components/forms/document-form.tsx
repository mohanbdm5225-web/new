"use client";

import { useState, useEffect } from "react";
import { DocumentItem, DocumentCategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useProjects, useTeam } from "@/lib/use-store";
import { uid } from "@/lib/id";

const CATEGORIES: DocumentCategory[] = ["Report", "Drawing", "Map", "Contract", "Invoice", "Data", "Other"];

export function DocumentForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: DocumentItem | null;
  onSubmit: (doc: DocumentItem) => void;
  onCancel: () => void;
}) {
  const { items: projects } = useProjects();
  const { items: team } = useTeam();
  const [form, setForm] = useState<DocumentItem>(() => initial || createEmpty());

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof DocumentItem>(key: K, value: DocumentItem[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="File Name" required>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. Project Report.pdf" />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Category">
          <Select value={form.category} onChange={(e) => set("category", e.target.value as DocumentCategory)} options={CATEGORIES} />
        </Field>
        <Field label="File Type" required>
          <Input value={form.fileType} onChange={(e) => set("fileType", e.target.value)} required placeholder="pdf, dwg, shp..." />
        </Field>
      </div>

      <Field label="Project (optional)">
        <Select
          value={form.projectId || ""}
          onChange={(e) => set("projectId", e.target.value || null)}
          options={[{ label: "— No project —", value: "" }, ...projects.map((p) => ({ label: p.name, value: p.id }))]}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Uploaded By">
          <Select
            value={form.uploadedBy}
            onChange={(e) => set("uploadedBy", e.target.value)}
            options={team.map((m) => ({ label: m.name, value: m.id }))}
          />
        </Field>
        <Field label="Size (bytes)">
          <Input type="number" value={form.size} onChange={(e) => set("size", Number(e.target.value))} />
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save Changes" : "Add Document"}</Button>
      </div>
    </form>
  );
}

function createEmpty(): DocumentItem {
  return {
    id: uid("d_"),
    name: "",
    category: "Report",
    projectId: null,
    size: 0,
    uploadedBy: "",
    uploadedAt: new Date().toISOString(),
    fileType: "pdf",
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