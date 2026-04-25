"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { ProjectPriority, ProjectStatus, ProjectType } from "@/lib/types";

export type ProjectFilterState = {
  search: string;
  status: ProjectStatus | "All";
  type: ProjectType | "All";
  priority: ProjectPriority | "All";
  sort: "name" | "progress" | "endDate" | "budget";
};

const STATUS: (ProjectStatus | "All")[] = ["All", "Planning", "Active", "On Hold", "Completed", "Cancelled"];
const TYPES: (ProjectType | "All")[] = ["All", "Drone Survey", "DGPS Survey", "LiDAR", "Bathymetry", "GIS/CAD", "Geospatial", "Tender Work"];
const PRIORITIES: (ProjectPriority | "All")[] = ["All", "Low", "Medium", "High", "Critical"];

export function ProjectFilters({
  state,
  setState,
  view,
  setView,
}: {
  state: ProjectFilterState;
  setState: (s: ProjectFilterState) => void;
  view: "table" | "grid";
  setView: (v: "table" | "grid") => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search projects, clients, codes…"
            value={state.search}
            onChange={(e) => setState({ ...state, search: e.target.value })}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                view === "table"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Table
            </button>
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${
                view === "grid"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Grid
            </button>
          </div>

          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <SlidersHorizontal className="h-4 w-4" /> More
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Select label="Status" value={state.status} onChange={(v) => setState({ ...state, status: v as ProjectStatus | "All" })} options={STATUS} />
        <Select label="Type" value={state.type} onChange={(v) => setState({ ...state, type: v as ProjectType | "All" })} options={TYPES} />
        <Select label="Priority" value={state.priority} onChange={(v) => setState({ ...state, priority: v as ProjectPriority | "All" })} options={PRIORITIES} />
        <Select label="Sort by" value={state.sort} onChange={(v) => setState({ ...state, sort: v as ProjectFilterState["sort"] })} options={["name", "progress", "endDate", "budget"]} />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}