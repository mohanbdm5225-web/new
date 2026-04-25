"use client";

import { useRef, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileText, Search, File, Image as ImageIcon, Map, FileSpreadsheet, FileSignature } from "lucide-react";
import { documents, getMemberById, getProjectById } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes, timeAgo } from "@/lib/utils";

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
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState(false);
  const [queued, setQueued] = useState<{ name: string; size: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map((f) => ({ name: f.name, size: f.size }));
    setQueued((prev) => [...next, ...prev]);
  };

  return (
    <div>
      <PageHeader title="Documents" description="Reports, drawings, contracts, data and deliverables — all in one place.">
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
        {queued.length > 0 && (
          <div className="mt-3 w-full max-w-md space-y-1">
            {queued.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-xs dark:bg-slate-800">
                <span className="truncate">{f.name}</span>
                <span className="text-slate-400">{formatBytes(f.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="pl-9" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => {
          const Icon = iconFor(d.fileType);
          const proj = d.projectId ? getProjectById(d.projectId) : null;
          const user = getMemberById(d.uploadedBy);
          return (
            <Card key={d.id} className="p-4 transition-shadow hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)]">
              <CardContent className="flex items-start gap-3 p-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{d.name}</p>
                  <p className="truncate text-xs text-slate-500">{proj?.name || "No project"} · {d.category}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{user?.name} · {timeAgo(d.uploadedAt)}</span>
                    <span className="font-num font-semibold text-slate-700">{formatBytes(d.size)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}