"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { initials } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Modal } from "@/components/ui/modal";
import { TeamForm } from "@/components/forms/team-form";
import { useTeam } from "@/lib/use-store";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { RowActions } from "@/components/shared/row-actions";
import { TeamMember } from "@/lib/types";

export default function ResourcesPage() {
  const { items: team, add, update, remove } = useTeam();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); setShowForm(true); };

  const handleSubmit = (m: TeamMember) => {
    if (editing) {
      update(m.id, m);
      toast.success("Member updated", m.name);
    } else {
      add(m);
      toast.success("Member added", m.name);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (m: TeamMember) => {
    const ok = await confirm({
      title: "Remove this member?",
      description: `${m.name} will be removed from the team.`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (ok) {
      remove(m.id);
      toast.success("Member removed");
    }
  };

  return (
    <div>
      <PageHeader title="Team" description="Surveyors, analysts, pilots and coordinators — their workload and focus areas.">
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Member</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {team.map((m) => (
          <Card key={m.id} className="p-5">
            <CardContent className="p-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white">
                    {initials(m.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.role}</p>
                  </div>
                </div>
                <RowActions onEdit={() => openEdit(m)} onDelete={() => handleDelete(m)} />
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                {m.email && <p className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5" /> {m.email}</p>}
                {m.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {m.phone}</p>}
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <span>Workload</span>
                  <span className="font-num text-slate-700">{m.workload}%</span>
                </div>
                <ProgressBar
                  value={m.workload}
                  height="h-1.5"
                  color={m.workload > 80 ? "bg-rose-500" : m.workload > 60 ? "bg-amber-500" : "bg-emerald-500"}
                />
              </div>

              {m.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {m.skills.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <span className="text-slate-500">{m.department || "—"}</span>
                <span className="font-num font-semibold text-slate-700">{m.activeProjects} projects</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {team.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center text-sm text-slate-500">
            No team members yet. Click "Add Member" to begin.
          </div>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? "Edit Member" : "Add New Member"}
        size="md"
      >
        <TeamForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}