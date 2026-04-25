"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { Modal } from "@/components/ui/modal";
import { TaskForm } from "@/components/forms/task-form";
import { useTasks } from "@/lib/use-store";
import { useToast } from "@/components/ui/toast";
import { Task } from "@/lib/types";

export default function TasksPage() {
  const { add, update } = useTasks();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleSubmit = (task: Task) => {
    if (editing) {
      update(task.id, task);
      toast.success("Task updated", task.title);
    } else {
      add(task);
      toast.success("Task created", task.title);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader title="Tasks" description="Plan and move work across stages. Click any card to edit.">
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New Task</Button>
      </PageHeader>

      <KanbanBoard onEditTask={(t) => { setEditing(t); setShowForm(true); }} />

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? "Edit Task" : "Create New Task"}
        size="md"
      >
        <TaskForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}