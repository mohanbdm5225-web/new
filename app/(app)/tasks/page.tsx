"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { KanbanBoard } from "@/components/tasks/kanban-board";

export default function TasksPage() {
  return (
    <div>
      <PageHeader title="Tasks" description="Plan and move work across stages. Drag-and-drop friendly kanban layout.">
        <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> Filter</Button>
        <Button size="sm"><Plus className="h-4 w-4" /> New Task</Button>
      </PageHeader>

      <KanbanBoard />
    </div>
  );
}