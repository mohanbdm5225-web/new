"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  GripVertical,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { tasks as initialTasks, projects, team } from "@/lib/mock-data";
import { Task, TaskStatus } from "@/lib/types";
import { cn, daysUntil, formatDate, initials } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

const columns: TaskStatus[] = [
  "Backlog",
  "To Do",
  "In Progress",
  "Review",
  "Done",
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const groupedTasks = useMemo(() => {
    return columns.reduce<Record<TaskStatus, Task[]>>((acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  function handleDrop(status: TaskStatus) {
    if (!draggedTaskId) return;

    setTasks((current) =>
      current.map((task) =>
        task.id === draggedTaskId ? { ...task, status } : task
      )
    );

    setDraggedTaskId(null);
  }

  function getProjectName(projectId: string) {
    return projects.find((project) => project.id === projectId)?.name ?? "No Project";
  }

  function getMemberName(memberId: string) {
    return team.find((member) => member.id === memberId)?.name ?? "Unassigned";
  }

  function getColumnStyle(status: TaskStatus) {
    if (status === "Done") return "border-emerald-200 bg-emerald-50/40";
    if (status === "Review") return "border-amber-200 bg-amber-50/40";
    if (status === "In Progress") return "border-blue-200 bg-blue-50/40";
    if (status === "To Do") return "border-slate-200 bg-slate-50/70";
    return "border-slate-200 bg-white";
  }

  return (
    <div className="grid gap-4 overflow-x-auto pb-3 xl:grid-cols-5">
      {columns.map((status) => (
        <div
          key={status}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(status)}
          className={cn(
            "min-h-[620px] min-w-[280px] rounded-2xl border p-3 transition-colors",
            getColumnStyle(status)
          )}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{status}</h3>
              <p className="text-xs text-slate-500">
                {groupedTasks[status].length} tasks
              </p>
            </div>

            <div className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              {groupedTasks[status].length}
            </div>
          </div>

          <div className="space-y-3">
            {groupedTasks[status].map((task) => {
              const remainingDays = daysUntil(task.dueDate);
              const isOverdue = remainingDays < 0 && task.status !== "Done";

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedTaskId(task.id)}
                  onDragEnd={() => setDraggedTaskId(null)}
                  className={cn(
                    "cursor-grab rounded-2xl border bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-pop active:cursor-grabbing",
                    draggedTaskId === task.id && "opacity-50",
                    isOverdue ? "border-rose-200" : "border-slate-200"
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                        {task.title}
                      </h4>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {task.description}
                      </p>
                    </div>

                    <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <StatusBadge status={task.priority} />

                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                        <AlertTriangle className="h-3 w-3" />
                        Overdue
                      </span>
                    )}

                    {task.status === "Done" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="line-clamp-1 text-xs font-medium text-slate-700">
                      {getProjectName(task.projectId)}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                          {initials(getMemberName(task.assigneeId))}
                        </div>
                        <p className="text-xs text-slate-600">
                          {getMemberName(task.assigneeId)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(task.dueDate)}
                    </span>

                    <span
                      className={cn(
                        "font-medium",
                        isOverdue
                          ? "text-rose-600"
                          : remainingDays <= 5
                          ? "text-amber-600"
                          : "text-slate-500"
                      )}
                    >
                      {task.status === "Done"
                        ? "Done"
                        : remainingDays < 0
                        ? `${Math.abs(remainingDays)}d late`
                        : `${remainingDays}d left`}
                    </span>
                  </div>
                </div>
              );
            })}

            {groupedTasks[status].length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-400">
                Drop tasks here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}