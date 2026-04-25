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
import { projects } from "@/lib/mock-data";
import { Project } from "@/lib/types";

export default function ProjectsPage() {
  const [view, setView] = useState<"table" | "grid">("table");
  const [state, setState] = useState<ProjectFilterState>({
    search: "",
    status: "All",
    type: "All",
    priority: "All",
    sort: "endDate",
  });
  const [selected, setSelected] = useState<Project | null>(null);

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
  }, [state]);

  return (
    <div>
      <PageHeader title="Projects" description="Plan, track and deliver all geospatial engagements across your portfolio.">
        <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
        <Button size="sm"><Plus className="h-4 w-4" /> New Project</Button>
      </PageHeader>

      <ProjectFilters state={state} setState={setState} view={view} setView={setView} />

      <div className="mt-5">
        {filtered.length === 0 ? (
          <EmptyState title="No projects match your filters" description="Try adjusting the search, status or type filter." icon={FolderKanban} />
        ) : view === "table" ? (
          <ProjectTable projects={filtered} onRowClick={setSelected} />
        ) : (
          <ProjectGrid projects={filtered} onCardClick={setSelected} />
        )}
      </div>

      <ProjectDrawer project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}