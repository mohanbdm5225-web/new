"use client";

import { useState, useEffect } from "react";
import { Project, ProjectPriority, ProjectStatus, ProjectType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/lib/use-store";
import { uid } from "@/lib/id";
import { MapPin } from "lucide-react";

const TYPES: ProjectType[] = ["Drone Survey", "DGPS Survey", "LiDAR", "Bathymetry", "GIS/CAD", "Geospatial", "Tender Work"];
const STATUSES: ProjectStatus[] = ["Planning", "Active", "On Hold", "Completed", "Cancelled"];
const PRIORITIES: ProjectPriority[] = ["Low", "Medium", "High", "Critical"];

export function ProjectForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Project | null;
  onSubmit: (project: Project) => void;
  onCancel: () => void;
}) {
  const { items: team } = useTeam();
  const [form, setForm] = useState<Project>(() => initial || createEmptyProject());

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof Project>(key: K, value: Project[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Project Code" required>
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="GS-2026-XXX" required />
        </Field>
        <Field label="Project Name" required>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Client" required>
          <Input value={form.client} onChange={(e) => set("client", e.target.value)} required />
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, State" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Latitude">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="number"
              step="any"
              value={form.latitude ?? ""}
              onChange={(e) => set("latitude", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="13.0827"
              className="pl-9"
            />
          </div>
        </Field>
        <Field label="Longitude">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="number"
              step="any"
              value={form.longitude ?? ""}
              onChange={(e) => set("longitude", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="80.2707"
              className="pl-9"
            />
          </div>
        </Field>
      </div>

      <p className="-mt-2 text-[10px] text-slate-500">
        Tip: get coordinates from Google Maps — right-click anywhere → click the lat/lng to copy.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Type">
          <Select value={form.type} onChange={(e) => set("type", e.target.value as ProjectType)} options={TYPES} />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)} options={STATUSES} />
        </Field>
        <Field label="Priority">
          <Select value={form.priority} onChange={(e) => set("priority", e.target.value as ProjectPriority)} options={PRIORITIES} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Start Date">
          <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </Field>
        <Field label="End Date">
          <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Budget (₹)">
          <Input type="number" value={form.budget} onChange={(e) => set("budget", Number(e.target.value))} />
        </Field>
        <Field label="Spent (₹)">
          <Input type="number" value={form.spent} onChange={(e) => set("spent", Number(e.target.value))} />
        </Field>
        <Field label="Progress (%)">
          <Input type="number" min={0} max={100} value={form.progress} onChange={(e) => set("progress", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Manager">
        <Select
          value={form.managerId}
          onChange={(e) => set("managerId", e.target.value)}
          options={[{ label: "— Select manager —", value: "" }, ...team.map((m) => ({ label: m.name, value: m.id }))]}
        />
      </Field>

      <Field label="Description">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
      </Field>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save Changes" : "Create Project"}</Button>
      </div>
    </form>
  );
}

function createEmptyProject(): Project {
  return {
    id: uid("p_"),
    code: "",
    name: "",
    client: "",
    type: "Drone Survey",
    status: "Planning",
    priority: "Medium",
    progress: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 60 * 86400 * 1000).toISOString().slice(0, 10),
    budget: 0,
    spent: 0,
    description: "",
    location: "",
    managerId: "",
    teamIds: [],
    latitude: undefined,
    longitude: undefined,
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