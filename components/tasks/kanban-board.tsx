"use client";

import { Task, TaskStatus, TeamMember } from "@/lib/types";
import { useTasks, useTeam, useProjects } from "@/lib/use-store";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, initials, daysUntil } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar, Flag, Pencil, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = items.find((t) => t.id === active.id);
    if (!activeTask) return;

    if (COLUMNS.includes(over.id as TaskStatus)) {
      const newStatus = over.id as TaskStatus;
      if (activeTask.status !== newStatus) {
        update(activeTask.id, { status: newStatus });
        toast.info("Moved", `${activeTask.title} → ${newStatus}`);
      }
      return;
    }

    const overTask = items.find((t) => t.id === over.id);
    if (overTask && activeTask.status !== overTask.status) {
      update(activeTask.id, { status: overTask.status });
      toast.info("Moved", `${activeTask.title} → ${overTask.status}`);
    }
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

  const activeTask = activeId ? items.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = items.filter((t) => t.status === col);
          return (
            <Column key={col} status={col} tasks={colTasks}>
              <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {colTasks.map((t) => {
                  const assignee = team.find((m) => m.id === t.assigneeId);
                  const project = projects.find((p) => p.id === t.projectId);
                  return (
                    <SortableTaskCard
                      key={t.id}
                      task={t}
                      assignee={assignee}
                      projectCode={project?.code}
                      onEdit={onEditTask}
                      onDelete={handleDelete}
                    />
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-400 dark:border-slate-700">
                    Drop tasks here
                  </div>
                )}
              </SortableContext>
            </Column>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCardView
            task={activeTask}
            assignee={team.find((m) => m.id === activeTask.assigneeId)}
            projectCode={projects.find((p) => p.id === activeTask.projectId)?.code}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  status,
  tasks,
  children,
}: {
  status: TaskStatus;
  tasks: Task[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[290px] shrink-0 flex-col rounded-2xl border bg-slate-50/60 p-3 transition-colors dark:bg-slate-900/60 ${
        isOver ? "border-indigo-400 bg-indigo-50/40 dark:bg-indigo-500/5" : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <span className="font-num text-xs font-semibold text-slate-500">{tasks.length}</span>
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SortableTaskCard({
  task,
  assignee,
  projectCode,
  onEdit,
  onDelete,
}: {
  task: Task;
  assignee?: TeamMember;
  projectCode?: string;
  onEdit?: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCardView
        task={task}
        assignee={assignee}
        projectCode={projectCode}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandle={listeners}
      />
    </div>
  );
}

function TaskCardView({
  task,
  assignee,
  projectCode,
  onEdit,
  onDelete,
  dragHandle,
  isDragging,
}: {
  task: Task;
  assignee?: TeamMember;
  projectCode?: string;
  onEdit?: (t: Task) => void;
  onDelete?: (t: Task) => void;
  dragHandle?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
}) {
  const overdue = task.status !== "Done" && daysUntil(task.dueDate) < 0;

  return (
    <motion.div
      initial={!isDragging ? { opacity: 0, y: 4 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group rounded-xl border bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:bg-slate-900 dark:border-slate-800 ${
        isDragging
          ? "rotate-1 cursor-grabbing border-indigo-400 shadow-[0_15px_40px_rgba(15,23,42,0.20)]"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)]"
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <button
          {...dragHandle}
          className="flex cursor-grab items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 active:cursor-grabbing"
          title="Drag to move"
        >
          <GripVertical className="h-3 w-3" />
          <Flag className="h-3 w-3" /> {task.priority}
        </button>
        {!isDragging && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                title="Edit"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task)}
                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">{task.title}</p>

      {projectCode && (
        <p className="mt-0.5 text-[10px] text-slate-500">{projectCode}</p>
      )}

      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
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
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}