"use client";

import { useRef, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileText, Search, File, Image as ImageIcon, Map, FileSpreadsheet, FileSignature, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes, timeAgo } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { DocumentForm } from "@/components/forms/document-form";
import { useDocuments, useProjects, useTeam } from "@/lib/use-store";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/shared/row-actions";
import { DocumentItem } from "@/lib/types";
import { uid } from "@/lib/id";

const iconFor = (type: string) => {
  const t = type.toLowerCase();
  if (["pdf", "docx", "doc"].includes(t)) return FileText;
  if (["dwg", "dxf"].includes(t)) return FileSignature;
  if (["png", "jpg", "jpeg", "tif"].includes(t)) return ImageIcon;
  if (["shp", "kml"].includes(t)) return Map;
  if (["csv", "xlsx"].includes(t)) return FileSpreadsheet;
  return File;
};

export default function DocumentsPage() {
  const { items: documents, add, update, remove } = useDocuments();
  const { items: projects } = useProjects();
  const { items: team } = useTeam();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [q, setQ] = useState("");
  const [drag, setDrag] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DocumentItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()));

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const firstUser = team[0];
    Array.from(files).forEach((f) => {
      const ext = f.name.includes(".") ? f.name.split(".").pop() || "file" : "file";
      const newDoc: DocumentItem = {
        id: uid("d_"),
        name: f.name,
        category: "Other",
        projectId: null,
        size: f.size,
        uploadedBy: firstUser?.id || "",
        uploadedAt: new Date().toISOString(),
        fileType: ext,
      };
      add(newDoc);
    });
    toast.success(`${files.length} file(s) added`, "Tip: actual file storage requires Phase 4 backend.");
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (d: DocumentItem) => { setEditing(d); setShowForm(true); };

  const handleSubmit = (doc: DocumentItem) => {
    if (editing) {
      update(doc.id, doc);
      toast.success("Document updated", doc.name);
    } else {
      add(doc);
      toast.success("Document added", doc.name);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (d: DocumentItem) => {
    const ok = await confirm({
      title: "Delete this document?",
      description: `"${d.name}" will be permanently removed from the list.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) {
      remove(d.id);
      toast.success("Document deleted");
    }
  };

  return (
    <div>
      <PageHeader title="Documents" description="Reports, drawings, contracts, data and deliverables — all in one place.">
        <Button variant="outline" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Manual Entry</Button>
        <Button size="sm" onClick={() => inputRef.current?.click()}>
          <UploadCloud className="h-4 w-4" /> Upload
        </Button>
      </PageHeader>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          drag ? "border-indigo-500 bg-indigo-50/60" : "border-slate-300 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/60"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:bg-slate-800">
          <UploadCloud className="h-5 w-5 text-indigo-600" />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Drag & drop files here</p>
        <p className="text-xs text-slate-500">
          or{" "}
          <button className="font-semibold text-indigo-600 hover:text-indigo-700" onClick={() => inputRef.current?.click()}>
            browse from your computer
          </button>
        </p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="pl-9" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => {
          const Icon = iconFor(d.fileType);
          const proj = d.projectId ? projects.find((p) => p.id === d.projectId) : null;
          const user = team.find((m) => m.id === d.uploadedBy);
          return (
            <Card key={d.id} className="p-4 transition-shadow hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)]">
              <CardContent className="flex items-start gap-3 p-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{d.name}</p>
                    <RowActions onEdit={() => openEdit(d)} onDelete={() => handleDelete(d)} />
                  </div>
                  <p className="truncate text-xs text-slate-500">{proj?.name || "No project"} · {d.category}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{user?.name || "—"} · {timeAgo(d.uploadedAt)}</span>
                    <span className="font-num font-semibold text-slate-700">{formatBytes(d.size)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center text-sm text-slate-500">
            No documents yet.
          </div>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? "Edit Document" : "Manual Document Entry"}
        size="md"
      >
        <DocumentForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}