"use client";

import { useState, useEffect } from "react";
import { TeamMember } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uid } from "@/lib/id";

export function TeamForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: TeamMember | null;
  onSubmit: (member: TeamMember) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TeamMember>(() => initial || createEmpty());
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof TeamMember>(key: K, value: TeamMember[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    set("skills", [...form.skills, s]);
    setSkillInput("");
  };

  const removeSkill = (s: string) => set("skills", form.skills.filter((x) => x !== s));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Full Name" required>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <Field label="Role" required>
          <Input value={form.role} onChange={(e) => set("role", e.target.value)} required />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Department">
          <Input value={form.department} onChange={(e) => set("department", e.target.value)} />
        </Field>
        <Field label="Workload (%)">
          <Input type="number" min={0} max={100} value={form.workload} onChange={(e) => set("workload", Number(e.target.value))} />
        </Field>
        <Field label="Active Projects">
          <Input type="number" min={0} value={form.activeProjects} onChange={(e) => set("activeProjects", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Skills">
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Type a skill and press Enter"
          />
          <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
        </div>
        {form.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {form.skills.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="text-slate-400 hover:text-rose-600">×</button>
              </span>
            ))}
          </div>
        )}
      </Field>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save Changes" : "Add Member"}</Button>
      </div>
    </form>
  );
}

function createEmpty(): TeamMember {
  return {
    id: uid("u_"),
    name: "",
    role: "",
    email: "",
    phone: "",
    avatar: "",
    department: "",
    workload: 0,
    activeProjects: 0,
    skills: [],
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