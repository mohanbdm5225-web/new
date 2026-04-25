"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ProjectMap } from "@/components/map/project-map";
import { useProjects } from "@/lib/use-store";
import { Project, ProjectStatus, ProjectType } from "@/lib/types";
import { Map as MapIcon, FolderKanban } from "lucide-react";
import Link from "next/link";
import { ProjectDrawer } from "@/components/projects/project-drawer";

const STATUSES: (ProjectStatus | "All")[] = ["All", "Planning", "Active", "On Hold", "Completed", "Cancelled"];
const TYPES: (ProjectType | "All")[] = ["All", "Drone Survey", "DGPS Survey", "LiDAR", "Bathymetry", "GIS/CAD", "Geospatial", "Tender Work"];

export default function MapPage() {
  const { items: projects } = useProjects();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<ProjectType | "All">("All");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const sm = statusFilter === "All" || p.status === statusFilter;
      const tm = typeFilter === "All" || p.type === typeFilter;
      return sm && tm;
    });
  }, [projects, statusFilter, typeFilter]);

  const withCoords = filtered.filter((p) => p.latitude && p.longitude).length;

  return (
    <div>
      <PageHeader
        title="Project Map"
        description="Geographic view of all your projects across India. Click any pin for details."
      >
        <Link href="/projects">
          <Button variant="outline" size="sm">
            <FolderKanban className="h-4 w-4" /> Project list
          </Button>
        </Link>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm">
          <MapIcon className="h-4 w-4 text-indigo-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {withCoords} of {filtered.length} project{filtered.length !== 1 ? "s" : ""} mapped
          </span>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
          <FilterChips
            label="Status"
            value={statusFilter}
            options={STATUSES}
            onChange={(v) => setStatusFilter(v as ProjectStatus | "All")}
          />
          <FilterChips
            label="Type"
            value={typeFilter}
            options={TYPES}
            onChange={(v) => setTypeFilter(v as ProjectType | "All")}
          />
        </div>
      </div>

      <ProjectMap projects={filtered} onSelectProject={setSelected} />

      <ProjectDrawer project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterChips({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}