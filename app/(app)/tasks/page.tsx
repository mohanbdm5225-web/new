"use client";

import { useMemo, useState } from "react";
import {
  CheckSquare,
  Clock,
  ListChecks,
  Plus,
  Search,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tasks } from "@/lib/mock-data";
import { daysUntil } from "@/lib/utils";

export default function TasksPage() {
  const [search, setSearch] = useState("");

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Done").length;
  const activeTasks = tasks.filter(
    (task) => task.status === "In Progress" || task.status === "Review"
  ).length;
  const overdueTasks = tasks.filter(
    (task) => daysUntil(task.dueDate) < 0 && task.status !== "Done"
  ).length;

  const filteredCount = useMemo(() => {
    if (!search.trim()) return totalTasks;

    return tasks.filter((task) =>
      `${task.title} ${task.description} ${task.status} ${task.priority}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ).length;
  }, [search, totalTasks]);

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Manage field work, processing work, reports, tender tasks and internal approvals using a drag-and-drop Kanban board."
      >
        <Button variant="outline">
          <ListChecks className="h-4 w-4" />
          Export
        </Button>

        <Button>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tasks"
          value={totalTasks}
          icon={CheckSquare}
          tone="indigo"
          hint="All project tasks"
          index={0}
        />

        <StatCard
          label="Active Tasks"
          value={activeTasks}
          icon={Clock}
          tone="amber"
          hint="In progress or review"
          index={1}
        />

        <StatCard
          label="Completed"
          value={completedTasks}
          icon={ListChecks}
          tone="emerald"
          hint="Marked as done"
          index={2}
        />

        <StatCard
          label="Overdue"
          value={overdueTasks}
          icon={AlertTriangle}
          tone="rose"
          hint="Needs immediate action"
          index={3}
        />
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Kanban Task Board
            </h2>
            <p className="text-sm text-slate-500">
              Drag tasks between columns to update status.
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              className="pl-9"
            />
          </div>
        </div>

        {search.trim() && (
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Search matched <b>{filteredCount}</b> task(s). The Kanban board
            below still shows all tasks so you can manage workflow easily.
          </div>
        )}
      </div>

      <KanbanBoard />
    </div>
  );
}