"use client";

import { Task, TaskStatus } from "@/lib/types";
import { useTasks, useTeam, useProjects } from "@/lib/use-store";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, initials, daysUntil } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar, Flag, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

const COLUMNS: TaskStatus[] = ["Backlog", "To Do", "In Progress", "Review", "Done"];

export function KanbanBoard({
  onEditTask,
}: {
  onEditTask?: (t: Task) => void;
}) {
  const { items, update, remove } = useTasks();
  const { items: team } = useTeam();
  const { items: projects } = useProjects();
  const toast = useToast();
  const { confirm } = useConfirm();

  const updateStatus = (id: string, status: TaskStatus) => {
    update(id, { status });
    toast.info("Status updated", status);
  };

  const handleDelete = async (t: Task) => {
    const ok = await confirm({
      title: "Delete this task?",
      description: `"${t.title}" will be permanently removed.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) {
      remove(t.id);
      toast.success("Task deleted");
    }
  };

  return (
    <div className="flex w-full gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTasks = items.filter((t) => t.status === col);
        return (
          <div key={col} className="flex w-[290px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:bg-slate-900/60 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={col} />
                <span className="font-num text-xs font-semibold text-slate-500">{colTasks.length}</span>
              </div>
            </div>

            <div className="space-y-2">
              {colTasks.map((t, i) => {
                const assignee = team.find((m) => m.id === t.assigneeId);
                const project = projects.find((p) => p.id === t.projectId);
                const overdue = t.status !== "Done" && daysUntil(t.dueDate) < 0;
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className="group rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:border-indigo-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)] dark:bg-slate-900 dark:border-slate-800"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        <Flag className="h-3 w-3" /> {t.priority}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {onEditTask && (
                          <button
                            onClick={() => onEditTask(t)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(t)}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">{t.title}</p>

                    {project && (
                      <p className="mt-0.5 text-[10px] text-slate-500">{project.code} · {project.name}</p>
                    )}

                    {t.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {assignee && (
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-[9px] font-bold text-white"
                            title={assignee.name}
                          >
                            {initials(assignee.name)}
                          </div>
                        )}
                        <span className={`flex items-center gap-1 text-[10px] ${overdue ? "text-rose-600 font-semibold" : "text-slate-500"}`}>
                          <Calendar className="h-3 w-3" />
                          {formatDate(t.dueDate)}
                        </span>
                      </div>

                      <select
                        value={t.status}
                        onChange={(e) => updateStatus(t.id, e.target.value as TaskStatus)}
                        className="h-6 rounded-md border border-slate-200 bg-white px-1 text-[10px] font-semibold text-slate-600 outline-none focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-400 dark:border-slate-700">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}