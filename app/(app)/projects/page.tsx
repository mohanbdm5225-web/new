"use client";

import * as XLSX from "xlsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Download,
  Eye,
  FileSpreadsheet,
  FolderKanban,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Project,
  ProjectPriority,
  ProjectStatus,
  ProjectType,
} from "@/lib/types";
import {
  addStoredProjects,
  deleteStoredProject,
  getStoredProjects,
} from "@/lib/project-store";
import { daysUntil, formatDate, formatINR } from "@/lib/utils";

type NhaiExcelRow = {
  "Sr No"?: string | number;
  UPC?: string;
  "Project Name"?: string;
  "Work Order No"?: string;
  "Scheduled Date of Inspection"?: string | number;
  "Scheduled Date of Closure"?: string | number;
  PIU?: string;
  "PD Name"?: string;
  "PD Mobile No."?: string | number;
  RO?: string;
  TSP?: string;
  "AE/IE NAME"?: string;
  "AE/IE Contact"?: string | number;
};

const projectStatuses: ProjectStatus[] = [
  "Planning",
  "Active",
  "On Hold",
  "Completed",
  "Cancelled",
];

const projectTypes: ProjectType[] = [
  "Drone Survey",
  "DGPS Survey",
  "LiDAR",
  "Bathymetry",
  "GIS/CAD",
  "Geospatial",
  "Tender Work",
];

const priorities: ProjectPriority[] = ["Low", "Medium", "High", "Critical"];

export default function ProjectsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [importMessage, setImportMessage] = useState("");

  function loadProjects() {
    setProjects(getStoredProjects());
  }

  useEffect(() => {
    loadProjects();
    window.addEventListener("projects-updated", loadProjects);

    return () => {
      window.removeEventListener("projects-updated", loadProjects);
    };
  }, []);

  const statuses = ["All", ...projectStatuses];
  const types = ["All", ...projectTypes];

  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (project) => project.status === "Active"
  ).length;
  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;
  const delayedProjects = projects.filter(
    (project) =>
      daysUntil(project.endDate) < 0 && project.status !== "Completed"
  ).length;

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = `${project.name} ${project.code} ${project.client} ${project.location} ${project.type} ${project.status} ${project.description}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = status === "All" || project.status === status;
      const matchesType = type === "All" || project.type === type;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, search, status, type]);

  function normalizeDate(value: string | number | undefined): string {
    if (!value) return new Date().toISOString().slice(0, 10);

    if (typeof value === "number") {
      const parsed = XLSX.SSF.parse_date_code(value);

      if (!parsed) return new Date().toISOString().slice(0, 10);

      const year = parsed.y;
      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    const parsedDate = new Date(text);

    if (!Number.isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const day = String(parsedDate.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    return new Date().toISOString().slice(0, 10);
  }

  function cleanText(value: unknown): string {
    return String(value ?? "").trim();
  }

  function createProjectId(upc: string, workOrder: string) {
    const raw = `${upc}-${workOrder}`.toLowerCase();
    return raw.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function convertNhaiRowsToProjects(rows: NhaiExcelRow[]): Project[] {
    return rows
      .map((row) => {
        const upc = cleanText(row.UPC);
        const projectName = cleanText(row["Project Name"]);
        const workOrderNo = cleanText(row["Work Order No"]);
        const inspectionDate = normalizeDate(row["Scheduled Date of Inspection"]);
        const closureDate = normalizeDate(row["Scheduled Date of Closure"]);
        const piu = cleanText(row.PIU);
        const pdName = cleanText(row["PD Name"]);
        const pdMobile = cleanText(row["PD Mobile No."]);
        const ro = cleanText(row.RO);
        const tsp = cleanText(row.TSP);
        const aeIeName = cleanText(row["AE/IE NAME"]);
        const aeIeContact = cleanText(row["AE/IE Contact"]);

        if (!upc || !projectName) {
          return null;
        }

        const description = [
          `NHAI Work Order No: ${workOrderNo || "Not specified"}`,
          `UPC: ${upc}`,
          `PIU: ${piu || "Not specified"}`,
          `RO: ${ro || "Not specified"}`,
          `TSP: ${tsp || "Not specified"}`,
          `PD Name: ${pdName || "Not specified"}`,
          `PD Mobile: ${pdMobile || "Not specified"}`,
          `AE/IE Name: ${aeIeName || "Not specified"}`,
          `AE/IE Contact: ${aeIeContact || "Not specified"}`,
        ].join("\n");

        const project: Project = {
          id: createProjectId(upc, workOrderNo || projectName),
          code: upc,
          name: projectName,
          client: "NHAI",
          type: "Drone Survey",
          status: "Planning",
          priority: "High",
          location: piu || ro || "NHAI Project Location",
          startDate: inspectionDate,
          endDate: closureDate,
          budget: 0,
          spent: 0,
          progress: 0,
          description,
          managerId: "u1",
          teamIds: ["u1", "u2"],
        };

        return project;
      })
      .filter(Boolean) as Project[];
  }

  async function handleExcelImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json<NhaiExcelRow>(worksheet, {
        defval: "",
      });

      const importedProjects = convertNhaiRowsToProjects(rows);

      if (importedProjects.length === 0) {
        setImportMessage(
          "No valid NHAI project rows found. Please check UPC and Project Name columns."
        );
        return;
      }

      const result = addStoredProjects(importedProjects);

      setImportMessage(
        `${result.imported} NHAI project(s) imported successfully. ${result.skipped} duplicate project(s) skipped.`
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setImportMessage(
        "Excel import failed. Please check the file format and column names."
      );
    }
  }

  function handleDownloadNhaiTemplate() {
    const templateRows = [
      {
        "Sr No": 1,
        UPC: "N/05015/02004/MH",
        "Project Name":
          "Balance work of Khed Ghat realignment & Narayangaon bypass on Khed Sinnar section of NH-60",
        "Work Order No": "37/Apr-2026/29607",
        "Scheduled Date of Inspection": "2026-04-20",
        "Scheduled Date of Closure": "2026-04-30",
        PIU: "Pune",
        "PD Name": "Sh. S.S. Kadam",
        "PD Mobile No.": "8130006201",
        RO: "RO-Mumbai",
        TSP: "TSP 1",
        "AE/IE NAME": "SA Infrastructure Consultant Pvt. Ltd.",
        "AE/IE Contact": "9011770279",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "NHAI Projects");
    XLSX.writeFile(workbook, "nhai-project-import-template.xlsx");
  }

  function handleExportCsv() {
    const headers = [
      "Project Code",
      "Project Name",
      "Client",
      "Type",
      "Status",
      "Priority",
      "Location",
      "Start Date",
      "End Date",
      "Budget",
      "Spent",
      "Progress",
      "Description",
    ];

    const rows = filteredProjects.map((project) => [
      project.code,
      project.name,
      project.client,
      project.type,
      project.status,
      project.priority,
      project.location,
      project.startDate,
      project.endDate,
      project.budget.toString(),
      project.spent.toString(),
      project.progress.toString(),
      project.description,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "projects-export.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage drone, DGPS, LiDAR, bathymetry, GIS/CAD, geospatial and NHAI work order projects."
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelImport}
          className="hidden"
        />

        <Button variant="outline" onClick={handleDownloadNhaiTemplate}>
          <FileSpreadsheet className="h-4 w-4" />
          NHAI Template
        </Button>

        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Import NHAI Excel
        </Button>

        <Button variant="outline" onClick={handleExportCsv}>
          <Download className="h-4 w-4" />
          Export
        </Button>

        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </PageHeader>

      {importMessage && (
        <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold text-indigo-700">
          {importMessage}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          icon={FolderKanban}
          tone="indigo"
          hint="All stored projects"
          index={0}
        />

        <StatCard
          label="Active"
          value={activeProjects}
          icon={CalendarDays}
          tone="emerald"
          hint="Currently active"
          index={1}
        />

        <StatCard
          label="Completed"
          value={completedProjects}
          icon={FolderKanban}
          tone="amber"
          hint="Finished projects"
          index={2}
        />

        <StatCard
          label="Delayed"
          value={delayedProjects}
          icon={CalendarDays}
          tone="rose"
          hint="Past end date"
          index={3}
        />
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:w-96">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search project, UPC, work order, PIU, RO..."
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

        <div className="mt-3 flex flex-wrap gap-2">
          {types.map((item) => (
            <button
              key={item}
              onClick={() => setType(item)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                type === item
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div className="col-span-3">Project</div>
          <div className="col-span-2">Client / Location</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2">Timeline</div>
          <div className="col-span-1">Budget</div>
          <div className="col-span-1">Progress</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {filteredProjects.map((project) => {
          const dueDays = daysUntil(project.endDate);

          return (
            <div
              key={project.id}
              className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="col-span-3">
                <Link href={`/projects/${project.id}`}>
                  <p className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-indigo-600">
                    {project.name}
                  </p>
                </Link>

                <p className="mt-1 text-xs text-slate-500">{project.code}</p>
              </div>

              <div className="col-span-2">
                <p className="line-clamp-1 text-sm text-slate-700">
                  {project.client}
                </p>
                <p className="line-clamp-1 text-xs text-slate-500">
                  {project.location}
                </p>
              </div>

              <div className="col-span-1">
                <StatusBadge status={project.status} />
              </div>

              <div className="col-span-1">
                <StatusBadge status={project.type} />
              </div>

              <div className="col-span-2">
                <p className="text-xs text-slate-600">
                  {formatDate(project.startDate)} → {formatDate(project.endDate)}
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    dueDays < 0 && project.status !== "Completed"
                      ? "text-rose-600"
                      : dueDays <= 7 && project.status !== "Completed"
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`}
                >
                  {project.status === "Completed"
                    ? "Closed"
                    : dueDays < 0
                    ? `${Math.abs(dueDays)}d overdue`
                    : `${dueDays}d left`}
                </p>
              </div>

              <div className="col-span-1">
                <p className="font-num text-xs font-semibold text-slate-900">
                  {formatINR(project.budget)}
                </p>
              </div>

              <div className="col-span-1">
                <div className="mb-1 flex justify-between text-xs">
                  <span>{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} />
              </div>

              <div className="col-span-1 flex justify-end gap-1">
                <Link href={`/projects/${project.id}`}>
                  <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                    <Eye className="h-4 w-4" />
                  </button>
                </Link>

                <button
                  onClick={() => deleteStoredProject(project.id)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="p-10 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              No projects found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Import NHAI Excel or create a new project.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}