"use client";

import { useState, useEffect } from "react";
import { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useProjects, useTeam } from "@/lib/use-store";
import { uid } from "@/lib/id";

const STATUSES: TaskStatus[] = ["Backlog", "To Do", "In Progress", "Review", "Done"];
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

export function TaskForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Task | null;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}) {
  const { items: projects } = useProjects();
  const { items: team } = useTeam();
  const [form, setForm] = useState<Task>(() => initial || createEmptyTask());
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof Task>(key: K, value: Task[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (form.tags.includes(t)) return;
    set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => set("tags", form.tags.filter((x) => x !== t));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title" required>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </Field>

      <Field label="Description">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Project" required>
          <Select
            value={form.projectId}
            onChange={(e) => set("projectId", e.target.value)}
            options={[{ label: "— Select project —", value: "" }, ...projects.map((p) => ({ label: p.name, value: p.id }))]}
            required
          />
        </Field>
        <Field label="Assignee" required>
          <Select
            value={form.assigneeId}
            onChange={(e) => set("assigneeId", e.target.value)}
            options={[{ label: "— Select assignee —", value: "" }, ...team.map((m) => ({ label: m.name, value: m.id }))]}
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as TaskStatus)} options={STATUSES} />
        </Field>
        <Field label="Priority">
          <Select value={form.priority} onChange={(e) => set("priority", e.target.value as TaskPriority)} options={PRIORITIES} />
        </Field>
        <Field label="Due Date">
          <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </Field>
      </div>

      <Field label="Tags">
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Type a tag and press Enter"
          />
          <Button type="button" variant="outline" onClick={addTag}>Add</Button>
        </div>
        {form.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {form.tags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {t}
                <button type="button" onClick={() => removeTag(t)} className="text-slate-400 hover:text-rose-600">×</button>
              </span>
            ))}
          </div>
        )}
      </Field>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save Changes" : "Create Task"}</Button>
      </div>
    </form>
  );
}

function createEmptyTask(): Task {
  return {
    id: uid("t_"),
    title: "",
    description: "",
    projectId: "",
    assigneeId: "",
    status: "To Do",
    priority: "Medium",
    dueDate: new Date(Date.now() + 14 * 86400 * 1000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tags: [],
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