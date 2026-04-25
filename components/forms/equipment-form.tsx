"use client";

import { useState, useEffect } from "react";
import { Equipment, EquipmentCategory, EquipmentStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/lib/use-store";
import { uid } from "@/lib/id";

const CATEGORIES: EquipmentCategory[] = ["Drone", "DGPS", "LiDAR Scanner", "Echo Sounder", "Total Station", "Workstation"];
const STATUSES: EquipmentStatus[] = ["Available", "In Use", "Maintenance", "Retired"];

export function EquipmentForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Equipment | null;
  onSubmit: (equipment: Equipment) => void;
  onCancel: () => void;
}) {
  const { items: team } = useTeam();
  const [form, setForm] = useState<Equipment>(() => initial || createEmpty());

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof Equipment>(key: K, value: Equipment[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Asset Name" required>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <Field label="Serial Number" required>
          <Input value={form.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} required />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Category">
          <Select value={form.category} onChange={(e) => set("category", e.target.value as EquipmentCategory)} options={CATEGORIES} />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as EquipmentStatus)} options={STATUSES} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Location">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <Field label="Assigned To">
          <Select
            value={form.assignedTo || ""}
            onChange={(e) => set("assignedTo", e.target.value || null)}
            options={[{ label: "— Unassigned —", value: "" }, ...team.map((m) => ({ label: m.name, value: m.id }))]}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Purchase Date">
          <Input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} />
        </Field>
        <Field label="Last Maintenance">
          <Input type="date" value={form.lastMaintenance} onChange={(e) => set("lastMaintenance", e.target.value)} />
        </Field>
        <Field label="Next Maintenance">
          <Input type="date" value={form.nextMaintenance} onChange={(e) => set("nextMaintenance", e.target.value)} />
        </Field>
      </div>

      <Field label="Value (₹)">
        <Input type="number" value={form.value} onChange={(e) => set("value", Number(e.target.value))} />
      </Field>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save Changes" : "Add Asset"}</Button>
      </div>
    </form>
  );
}

function createEmpty(): Equipment {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: uid("eq_"),
    name: "",
    serialNumber: "",
    category: "Drone",
    status: "Available",
    location: "Chennai HQ",
    assignedTo: null,
    lastMaintenance: today,
    nextMaintenance: new Date(Date.now() + 180 * 86400 * 1000).toISOString().slice(0, 10),
    purchaseDate: today,
    value: 0,
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