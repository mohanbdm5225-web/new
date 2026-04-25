"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCompactINR, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { EquipmentForm } from "@/components/forms/equipment-form";
import { useEquipment, useTeam } from "@/lib/use-store";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/shared/row-actions";
import { Equipment } from "@/lib/types";

export default function EquipmentPage() {
  const { items: equipment, add, update, remove } = useEquipment();
  const { items: team } = useTeam();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(equipment.map((e) => e.category)))], [equipment]);

  const filtered = equipment.filter((e) => {
    const qm = !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.serialNumber.toLowerCase().includes(q.toLowerCase());
    const cm = cat === "All" || e.category === cat;
    return qm && cm;
  });

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (e: Equipment) => { setEditing(e); setShowForm(true); };

  const handleSubmit = (eq: Equipment) => {
    if (editing) {
      update(eq.id, eq);
      toast.success("Equipment updated", eq.name);
    } else {
      add(eq);
      toast.success("Equipment added", eq.name);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (e: Equipment) => {
    const ok = await confirm({
      title: "Remove this asset?",
      description: `"${e.name}" will be permanently removed from inventory.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) {
      remove(e.id);
      toast.success("Asset removed");
    }
  };

  return (
    <div>
      <PageHeader title="Equipment" description="Drones, DGPS units, LiDAR scanners, echo sounders and field assets.">
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Asset</Button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or serial number…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:bg-slate-900 dark:border-slate-800">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                cat === c ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 text-left">Asset</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Assigned</th>
                <th className="px-4 py-3 text-left">Next Maintenance</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const user = e.assignedTo ? team.find((m) => m.id === e.assignedTo) : null;
                return (
                  <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{e.name}</p>
                      <p className="font-num text-[11px] text-slate-500">{e.serialNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{e.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{e.location}</td>
                    <td className="px-4 py-3 text-slate-600">{user?.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(e.nextMaintenance)}</td>
                    <td className="px-4 py-3 font-num font-semibold text-slate-900 dark:text-slate-100">{formatCompactINR(e.value)}</td>
                    <td className="px-4 py-3 text-right">
                      <RowActions onEdit={() => openEdit(e)} onDelete={() => handleDelete(e)} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                    No equipment found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? "Edit Asset" : "Add New Asset"}
        size="md"
      >
        <EquipmentForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}