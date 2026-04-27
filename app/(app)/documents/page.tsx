"use client";

import { useMemo, useState } from "react";
import {
  UploadCloud,
  FileText,
  Search,
  Download,
  Eye,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { documents, projects, team } from "@/lib/mock-data";
import { formatBytes, formatDate, timeAgo } from "@/lib/utils";

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(documents.map((document) => document.category))),
  ];

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const project = projects.find((item) => item.id === document.projectId);
      const uploadedBy = team.find((item) => item.id === document.uploadedBy);

      const matchesSearch = `${document.name} ${document.category} ${
        project?.name ?? ""
      } ${uploadedBy?.name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || document.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const totalStorage = documents.reduce(
    (sum, document) => sum + document.size,
    0
  );

  function getProjectName(projectId: string | null) {
    if (!projectId) return "General";
    return projects.find((project) => project.id === projectId)?.name ?? "General";
  }

  function getUploaderName(userId: string) {
    return team.find((member) => member.id === userId)?.name ?? "Unknown";
  }

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Manage project reports, maps, drawings, invoices, contracts, GIS files, drone outputs and tender documents."
      >
        <Button variant="outline">
          <FolderOpen className="h-4 w-4" />
          New Folder
        </Button>

        <Button>
          <UploadCloud className="h-4 w-4" />
          Upload File
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Total Documents</p>
          <p className="font-num mt-2 text-3xl font-bold text-slate-900">
            {documents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Storage Used</p>
          <p className="font-num mt-2 text-3xl font-bold text-slate-900">
            {formatBytes(totalStorage)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">File Categories</p>
          <p className="font-num mt-2 text-3xl font-bold text-slate-900">
            {categories.length - 1}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/40 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
          <UploadCloud className="h-7 w-7 text-indigo-600" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-900">
          Upload project documents
        </h3>

        <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">
          Drag and drop PDF, DWG, SHP, KML, LAS, TIFF, DOCX, XLSX and project
          files here. This is UI mock only. Backend storage can be added later.
        </p>

        <div className="mt-4 flex justify-center gap-2">
          <Button>
            <UploadCloud className="h-4 w-4" />
            Choose Files
          </Button>

          <Button variant="outline">Upload Folder</Button>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents, projects, uploaders..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  category === item
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
          <div className="col-span-5">Document</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Project</div>
          <div className="col-span-1">Size</div>
          <div className="col-span-1">Uploaded</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {filteredDocuments.map((document) => (
          <div
            key={document.id}
            className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50"
          >
            <div className="col-span-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {document.name}
                </p>
                <p className="text-xs text-slate-500">
                  Uploaded by {getUploaderName(document.uploadedBy)} •{" "}
                  {timeAgo(document.uploadedAt)}
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <StatusBadge status={document.category} />
            </div>

            <div className="col-span-2">
              <p className="line-clamp-1 text-sm text-slate-600">
                {getProjectName(document.projectId)}
              </p>
            </div>

            <div className="col-span-1">
              <p className="font-num text-sm text-slate-600">
                {formatBytes(document.size)}
              </p>
            </div>

            <div className="col-span-1">
              <p className="text-xs text-slate-500">
                {formatDate(document.uploadedAt)}
              </p>
            </div>

            <div className="col-span-1 flex justify-end gap-1">
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <Eye className="h-4 w-4" />
              </button>

              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <Download className="h-4 w-4" />
              </button>

              <button className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              No documents found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}