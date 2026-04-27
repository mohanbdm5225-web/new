"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardList, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projects, team } from "@/lib/mock-data";
import { DsrEntry, saveDsrEntry } from "@/lib/dsr-store";

export function DsrForm() {
  const [date, setDate] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [reportedBy, setReportedBy] = useState(team[0]?.id ?? "");
  const [workType, setWorkType] = useState("Drone Survey");
  const [location, setLocation] = useState("");
  const [progress, setProgress] = useState("");
  const [workDone, setWorkDone] = useState("");
  const [issues, setIssues] = useState("");
  const [nextPlan, setNextPlan] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedProject = projects.find((project) => project.id === projectId);
    const selectedReporter = team.find((member) => member.id === reportedBy);

    const newEntry: DsrEntry = {
      id: crypto.randomUUID(),
      date,
      projectId,
      projectName: selectedProject?.name ?? "Unknown Project",
      reportedById: reportedBy,
      reportedByName: selectedReporter?.name ?? "Unknown User",
      workType,
      location,
      progress: Number(progress),
      workDone,
      issues,
      nextPlan,
      createdAt: new Date().toISOString(),
    };

    saveDsrEntry(newEntry);

    setSaved(true);
    setDate("");
    setLocation("");
    setProgress("");
    setWorkDone("");
    setIssues("");
    setNextPlan("");

    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <ClipboardList className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Create DSR</h2>
          <p className="text-sm text-slate-500">
            Save daily field/team report locally.
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            DSR saved successfully.
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Field label="Date">
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </Field>

        <Field label="Project">
          <Select
            value={projectId}
            onChange={setProjectId}
            options={projects.map((project) => ({
              label: `${project.code} — ${project.name}`,
              value: project.id,
            }))}
          />
        </Field>

        <Field label="Reported By">
          <Select
            value={reportedBy}
            onChange={setReportedBy}
            options={team.map((member) => ({
              label: `${member.name} — ${member.role}`,
              value: member.id,
            }))}
          />
        </Field>

        <Field label="Work Type">
          <Select
            value={workType}
            onChange={setWorkType}
            options={[
              { label: "Drone Survey", value: "Drone Survey" },
              { label: "DGPS Survey", value: "DGPS Survey" },
              { label: "LiDAR", value: "LiDAR" },
              { label: "Bathymetry", value: "Bathymetry" },
              { label: "GIS/CAD", value: "GIS/CAD" },
              { label: "Tender Work", value: "Tender Work" },
              { label: "Office Work", value: "Office Work" },
            ]}
          />
        </Field>

        <Field label="Location">
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Example: Chennai site"
            required
          />
        </Field>

        <Field label="Progress %">
          <Input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => setProgress(event.target.value)}
            placeholder="Example: 45"
            required
          />
        </Field>

        <TextArea
          label="Work Done Today"
          value={workDone}
          onChange={setWorkDone}
          placeholder="Enter completed work details..."
        />

        <TextArea
          label="Issues / Constraints"
          value={issues}
          onChange={setIssues}
          placeholder="Enter weather delay, permission issue, client dependency..."
        />

        <TextArea
          label="Next Day Plan"
          value={nextPlan}
          onChange={setNextPlan}
          placeholder="Enter next day work plan..."
        />

        <Button type="submit" className="w-full">
          <Save className="h-4 w-4" />
          Save DSR
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        required
      />
    </label>
  );
}