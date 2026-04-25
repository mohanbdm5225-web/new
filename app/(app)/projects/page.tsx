"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Download, FolderKanban } from "lucide-react";
import { ProjectFilters, ProjectFilterState } from "@/components/projects/project-filters";
import { ProjectTable } from "@/components/projects/project-table";
import { ProjectGrid } from "@/components/projects/project-grid";
import { ProjectDrawer } from "@/components/projects/project-drawer";
import { EmptyState } from "@/components/shared/empty-state";
import { Project } from "@/lib/types";
import { useProjects } from "@/lib/use-store";
import { Modal } from "@/components/ui/modal";
import { ProjectForm } from "@/components/forms/project-form";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

export default function ProjectsPage() {
  const { items: projects, add, update, remove, loaded } = useProjects();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [view, setView] = useState<"table" | "grid">("table");
  const [state, setState] = useState<ProjectFilterState>({
    search: "",
    status: "All",
    type: "All",
    priority: "All",
    sort: "endDate",
  });
  const [selected, setSelected] = useState<Project | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      const q = state.search.toLowerCase();
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      const matchesStatus = state.status === "All" || p.status === state.status;
      const matchesType = state.type === "All" || p.type === state.type;
      const matchesPriority = state.priority === "All" || p.priority === state.priority;
      return matchesQ && matchesStatus && matchesType && matchesPriority;
    });

    list = [...list].sort((a, b) => {
      switch (state.sort) {
        case "name": return a.name.localeCompare(b.name);
        case "progress": return b.progress - a.progress;
        case "budget": return b.budget - a.budget;
        case "endDate":
        default: return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
    });

    return list;
  }, [state, projects]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setShowForm(true);
    setSelected(null);
  };

  const handleSubmit = (project: Project) => {
    if (editing) {
      update(project.id, project);
      toast.success("Project updated", project.name);
    } else {
      add(project);
      toast.success("Project created", project.name);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (p: Project) => {
    const ok = await confirm({
      title: "Delete this project?",
      description: `"${p.name}" will be permanently removed. Tasks linked to it will keep referencing the deleted ID.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) {
      remove(p.id);
      toast.success("Project deleted");
      setSelected(null);
    }
  };

  return (
    <div>
      <PageHeader title="Projects" description="Plan, track and deliver all geospatial engagements across your portfolio.">
        <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New Project</Button>
      </PageHeader>

      <ProjectFilters state={state} setState={setState} view={view} setView={setView} />

      <div className="mt-5">
        {!loaded ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:bg-slate-900 dark:border-slate-800">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started."
            icon={FolderKanban}
            action={<Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New Project</Button>}
          />
        ) : view === "table" ? (
          <ProjectTable projects={filtered} onRowClick={setSelected} />
        ) : (
          <ProjectGrid projects={filtered} onCardClick={setSelected} />
        )}
      </div>

      <ProjectDrawer
        project={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        title={editing ? "Edit Project" : "Create New Project"}
        description={editing ? "Update project details" : "Add a new geospatial engagement"}
        size="lg"
      >
        <ProjectForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}