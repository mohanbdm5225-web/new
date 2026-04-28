"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Download,
  FolderKanban,
  MapPinned,
  Navigation,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  projects as defaultProjects,
  team as defaultTeam,
  tasks as defaultTasks,
} from "@/lib/mock-data";
import { getStoredProjects, saveStoredProjects } from "@/lib/project-store";
import { Project, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { daysUntil, formatDate } from "@/lib/utils";

const NHAI_TASK_STORAGE_KEY = "nhai_task_allocations";
const NHAI_FIELD_UPDATE_STORAGE_KEY = "nhai_field_updates";
const NHAI_WORKSPACE_EVENT = "nhai-workspace-updated";

type DashboardMode = "coordinator" | "field";

type FieldStatus =
  | "Not Started"
  | "Travelling"
  | "On Site"
  | "Survey Done"
  | "Data Uploaded"
  | "Issue Found";

type SurveyTaskType = "Drone" | "DGPS" | "GCP" | "Inspection" | "Processing";

type FieldUpdate = {
  taskId: string;
  projectId: string;
  status: FieldStatus;
  workDone: string;
  chainageCovered: string;
  droneCompleted: boolean;
  gcpCompleted: boolean;
  issue: string;
  nextAction: string;
  attachmentName: string;
  updatedAt: string;
  savedOffline: boolean;
};

type ProjectContact = {
  piu: string;
  ro: string;
  pdName: string;
  pdMobile: string;
  aeIeName: string;
  aeIeContact: string;
  workOrder: string;
};

const fieldStatuses: FieldStatus[] = [
  "Not Started",
  "Travelling",
  "On Site",
  "Survey Done",
  "Data Uploaded",
  "Issue Found",
];

const taskPriorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

const quickTaskTemplates = [
  "Drone survey",
  "DGPS survey",
  "GCP marking",
  "Site inspection",
  "Data upload",
];

const workTypeConfig: Array<{
  type: SurveyTaskType;
  keywords: string[];
  targetLabel: string;
}> = [
  { type: "GCP", keywords: ["gcp", "control", "base station"], targetLabel: "GCP" },
  { type: "Drone", keywords: ["drone", "flight", "fly", "uav", "aerial", "lidar"], targetLabel: "Drone flight" },
  { type: "DGPS", keywords: ["dgps", "topo", "topographic", "survey"], targetLabel: "DGPS" },
  { type: "Inspection", keywords: ["inspection", "site", "visit", "chainage"], targetLabel: "Inspection" },
  { type: "Processing", keywords: ["processing", "upload", "data", "report", "qc"], targetLabel: "Processing" },
];

function isNhaiProject(project: Project) {
  return project.client.toLowerCase() === "nhai";
}

function readProjects() {
  return getStoredProjects();
}

function readNhaiTasks(projects: Project[]) {
  const nhaiIds = new Set(projects.filter(isNhaiProject).map((project) => project.id));

  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(NHAI_TASK_STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Task[];
        return Array.isArray(parsed)
          ? parsed.filter((task) => nhaiIds.has(task.projectId))
          : [];
      } catch {
        window.localStorage.removeItem(NHAI_TASK_STORAGE_KEY);
      }
    }
  }

  return defaultTasks.filter((task) => nhaiIds.has(task.projectId));
}

function readDefaultNhaiTasks() {
  const nhaiIds = new Set(defaultProjects.filter(isNhaiProject).map((project) => project.id));
  return defaultTasks.filter((task) => nhaiIds.has(task.projectId));
}

function readFieldUpdates() {
  if (typeof window === "undefined") return [];

  const stored = window.localStorage.getItem(NHAI_FIELD_UPDATE_STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as FieldUpdate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(NHAI_FIELD_UPDATE_STORAGE_KEY);
    return [];
  }
}

function mergeFieldUpdates(localUpdates: FieldUpdate[], remoteUpdates: FieldUpdate[]) {
  const merged = new Map<string, FieldUpdate>();

  [...localUpdates, ...remoteUpdates].forEach((update) => {
    const existing = merged.get(update.taskId);

    if (!existing || new Date(update.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
      merged.set(update.taskId, update);
    }
  });

  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

function mergeTasks(localTasks: Task[], remoteTasks: Task[]) {
  const merged = new Map<string, Task>();

  [...localTasks, ...remoteTasks].forEach((task) => {
    merged.set(task.id, task);
  });

  return Array.from(merged.values());
}

async function readRemoteWorkspace() {
  const response = await fetch("/api/nhai/workspace", {
    cache: "no-store",
  });

  if (!response.ok) return { tasks: [], updates: [] };

  const data = (await response.json()) as {
    tasks?: Task[];
    updates?: Partial<FieldUpdate>[];
  };

  const updates = (data.updates ?? [])
    .filter((update): update is Partial<FieldUpdate> & Pick<FieldUpdate, "taskId" | "projectId" | "status"> => {
      return Boolean(update.taskId && update.projectId && update.status);
    })
    .map((update) => ({
      taskId: update.taskId,
      projectId: update.projectId,
      status: update.status,
      workDone: update.workDone ?? "",
      chainageCovered: update.chainageCovered ?? "",
      droneCompleted: update.droneCompleted ?? false,
      gcpCompleted: update.gcpCompleted ?? false,
      issue: update.issue ?? "",
      nextAction: update.nextAction ?? "",
      attachmentName: update.attachmentName ?? "",
      updatedAt: update.updatedAt ?? new Date().toISOString(),
      savedOffline: false,
    }));

  return {
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    updates,
  };
}

function persistRemoteWorkspace(projects: Project[], tasks: Task[], updates: FieldUpdate[]) {
  void fetch("/api/nhai/workspace", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projects: projects.filter(isNhaiProject), tasks, updates }),
  }).catch(() => {
    // Local storage remains the fallback when the dev API is offline.
  });
}

function persistTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NHAI_TASK_STORAGE_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new Event(NHAI_WORKSPACE_EVENT));
}

function persistFieldUpdates(updates: FieldUpdate[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NHAI_FIELD_UPDATE_STORAGE_KEY, JSON.stringify(updates));
  window.dispatchEvent(new Event(NHAI_WORKSPACE_EVENT));
}

function taskTypeFromTask(task: Task): SurveyTaskType {
  const text = `${task.title} ${task.description} ${task.tags.join(" ")}`.toLowerCase();
  return workTypeConfig.find((item) => item.keywords.some((keyword) => text.includes(keyword)))?.type ?? "Inspection";
}

function fieldStatusFromTask(task: Task, update?: FieldUpdate): FieldStatus {
  if (update?.status) return update.status;
  if (task.status === "Done") return "Data Uploaded";
  if (task.status === "Review") return "Survey Done";
  if (task.status === "In Progress") return "On Site";
  return "Not Started";
}

function surveyorStatusLabel(update?: FieldUpdate) {
  return update?.status ?? "Not updated";
}

function taskStatusFromFieldStatus(status: FieldStatus): TaskStatus {
  if (status === "Data Uploaded") return "Done";
  if (status === "Survey Done") return "Review";
  if (status === "Travelling" || status === "On Site" || status === "Issue Found") return "In Progress";
  return "To Do";
}

function extractProjectContact(project: Project): ProjectContact {
  const lines = project.description.split(/\r?\n/);

  function findValue(label: string) {
    const line = lines.find((item) => item.toLowerCase().startsWith(label.toLowerCase()));
    return line?.split(":").slice(1).join(":").trim() || "";
  }

  return {
    piu: findValue("PIU") || project.location,
    ro: findValue("RO"),
    pdName: findValue("PD Name"),
    pdMobile: findValue("PD Mobile"),
    aeIeName: findValue("AE/IE Name"),
    aeIeContact: findValue("AE/IE Contact"),
    workOrder: findValue("NHAI Work Order No"),
  };
}

function cleanPhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function googleMapsUrl(project: Project) {
  if (typeof project.latitude === "number" && typeof project.longitude === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location || project.name)}`;
}

function exportCsv(projects: Project[], tasks: Task[], updates: FieldUpdate[]) {
  const rows = [
    [
      "Project Code",
      "Project Name",
      "Location",
      "PIU",
      "Task",
      "Task Type",
      "Assignee",
      "Field Status",
      "Due Date",
      "Chainage Covered",
      "Issue",
      "Next Action",
    ],
    ...projects.flatMap((project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      const contact = extractProjectContact(project);

      if (projectTasks.length === 0) {
        return [[project.code, project.name, project.location, contact.piu, "", "", "", "", "", "", "", ""]];
      }

      return projectTasks.map((task) => {
        const update = updates.find((item) => item.taskId === task.id);
        const assignee = defaultTeam.find((member) => member.id === task.assigneeId);

        return [
          project.code,
          project.name,
          project.location,
          contact.piu,
          task.title,
          taskTypeFromTask(task),
          assignee?.name ?? "Unassigned",
          fieldStatusFromTask(task, update),
          task.dueDate,
          update?.chainageCovered ?? "",
          update?.issue ?? "",
          update?.nextAction ?? "",
        ];
      });
    }),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "nhai-field-management.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function emptyUpdate(task: Task): FieldUpdate {
  return {
    taskId: task.id,
    projectId: task.projectId,
    status: fieldStatusFromTask(task),
    workDone: "",
    chainageCovered: "",
    droneCompleted: false,
    gcpCompleted: false,
    issue: "",
    nextAction: "",
    attachmentName: "",
    updatedAt: new Date().toISOString(),
    savedOffline: true,
  };
}

export function NhaiProjectManagementDashboard() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [tasks, setTasks] = useState<Task[]>(() => readDefaultNhaiTasks());
  const [fieldUpdates, setFieldUpdates] = useState<FieldUpdate[]>([]);
  const [mode, setMode] = useState<DashboardMode>("coordinator");
  const [search, setSearch] = useState("");
  const [fieldMemberId, setFieldMemberId] = useState(defaultTeam[0]?.id ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority | "">("");
  const [saveMessage, setSaveMessage] = useState("");

  const nhaiProjects = useMemo(() => projects.filter(isNhaiProject), [projects]);
  const activeProjectId = selectedProjectId || nhaiProjects[0]?.id || "";

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase();
    return nhaiProjects.filter((project) =>
      `${project.code} ${project.name} ${project.location} ${project.status} ${project.description}`
        .toLowerCase()
        .includes(query)
    );
  }, [nhaiProjects, search]);

  const fieldTasks = useMemo(() => {
    return tasks
      .filter((task) => task.assigneeId === fieldMemberId)
      .sort((left, right) => {
        const leftDue = daysUntil(left.dueDate);
        const rightDue = daysUntil(right.dueDate);
        return leftDue - rightDue;
      });
  }, [fieldMemberId, tasks]);

  const todayTasks = fieldTasks.filter((task) => {
    const dueDays = daysUntil(task.dueDate);
    const update = fieldUpdates.find((item) => item.taskId === task.id);
    return dueDays <= 3 || fieldStatusFromTask(task, update) !== "Data Uploaded";
  });

  const openTaskCount = tasks.filter((task) => task.status !== "Done").length;
  const overdueTaskCount = tasks.filter(
    (task) => task.status !== "Done" && daysUntil(task.dueDate) < 0
  ).length;
  const assignedProjectCount = nhaiProjects.filter((project) => project.teamIds.length > 0).length;
  const averageProgress = nhaiProjects.length
    ? Math.round(nhaiProjects.reduce((sum, project) => sum + project.progress, 0) / nhaiProjects.length)
    : 0;

  useEffect(() => {
    function refreshNhaiWorkspace() {
      const nextProjects = readProjects();
      const localTasks = readNhaiTasks(nextProjects);
      const localUpdates = readFieldUpdates();

      setProjects(nextProjects);
      setTasks(localTasks);
      setFieldUpdates(localUpdates);

      void readRemoteWorkspace()
        .then((remoteWorkspace) => {
          const nextTasks = mergeTasks(localTasks, remoteWorkspace.tasks);
          const nextUpdates = mergeFieldUpdates(localUpdates, remoteWorkspace.updates);

          setTasks(nextTasks);
          setFieldUpdates(nextUpdates);
          window.localStorage.setItem(NHAI_TASK_STORAGE_KEY, JSON.stringify(nextTasks));
          window.localStorage.setItem(NHAI_FIELD_UPDATE_STORAGE_KEY, JSON.stringify(nextUpdates));
        })
        .catch(() => {
          setTasks(localTasks);
          setFieldUpdates(localUpdates);
        });
    }

    const hydrationTimer = window.setTimeout(refreshNhaiWorkspace, 0);
    const apiPollTimer = window.setInterval(refreshNhaiWorkspace, 5000);

    window.addEventListener("projects-updated", refreshNhaiWorkspace);
    window.addEventListener(NHAI_WORKSPACE_EVENT, refreshNhaiWorkspace);
    window.addEventListener("storage", refreshNhaiWorkspace);

    return () => {
      window.clearTimeout(hydrationTimer);
      window.clearInterval(apiPollTimer);
      window.removeEventListener("projects-updated", refreshNhaiWorkspace);
      window.removeEventListener(NHAI_WORKSPACE_EVENT, refreshNhaiWorkspace);
      window.removeEventListener("storage", refreshNhaiWorkspace);
    };
  }, []);

  function flashMessage(message: string) {
    setSaveMessage(message);
    window.setTimeout(() => setSaveMessage(""), 1800);
  }

  function syncTasks(nextTasks: Task[]) {
    setTasks(nextTasks);
    persistTasks(nextTasks);
    persistRemoteWorkspace(projects, nextTasks, fieldUpdates);
    flashMessage("Saved on device");
  }

  function syncFieldUpdates(nextUpdates: FieldUpdate[]) {
    setFieldUpdates(nextUpdates);
    persistFieldUpdates(nextUpdates);
    persistRemoteWorkspace(projects, tasks, nextUpdates);
    flashMessage("Field update saved on device");
  }

  function updateFieldStatus(task: Task, status: FieldStatus) {
    const nextTaskStatus = taskStatusFromFieldStatus(status);
    const existing = fieldUpdates.find((item) => item.taskId === task.id);
    const nextUpdate = {
      ...(existing ?? emptyUpdate(task)),
      status,
      updatedAt: new Date().toISOString(),
      savedOffline: true,
    };

    const nextTasks = tasks.map((item) => (item.id === task.id ? { ...item, status: nextTaskStatus } : item));
    const nextUpdates = [
      nextUpdate,
      ...fieldUpdates.filter((item) => item.taskId !== task.id),
    ];

    setTasks(nextTasks);
    setFieldUpdates(nextUpdates);
    persistTasks(nextTasks);
    persistFieldUpdates(nextUpdates);
    persistRemoteWorkspace(projects, nextTasks, nextUpdates);
    flashMessage("Field update saved on device and mobile workspace");
  }

  function updateFieldForm(task: Task, patch: Partial<FieldUpdate>) {
    const existing = fieldUpdates.find((item) => item.taskId === task.id);
    const nextUpdate = {
      ...(existing ?? emptyUpdate(task)),
      ...patch,
      updatedAt: new Date().toISOString(),
      savedOffline: true,
    };

    syncFieldUpdates([
      nextUpdate,
      ...fieldUpdates.filter((item) => item.taskId !== task.id),
    ]);
  }

  function deleteFieldTask(task: Task) {
    const confirmed = window.confirm(`Delete "${task.title}" from Field Team View?`);

    if (!confirmed) return;

    const nextTasks = tasks.filter((item) => item.id !== task.id);
    const nextUpdates = fieldUpdates.filter((item) => item.taskId !== task.id);

    setTasks(nextTasks);
    setFieldUpdates(nextUpdates);
    persistTasks(nextTasks);
    persistFieldUpdates(nextUpdates);
    persistRemoteWorkspace(projects, nextTasks, nextUpdates);
    flashMessage("Field task deleted");
  }

  function clearTaskForm() {
    setNewTaskTitle("");
    setSelectedAssigneeId("");
    setNewTaskDueDate("");
    setNewTaskPriority("");
  }

  function assignTask(projectId = activeProjectId) {
    if (!projectId || !selectedAssigneeId || !newTaskDueDate || !newTaskPriority) {
      flashMessage("Select field person, due date, and priority");
      return;
    }

    const project = nhaiProjects.find((item) => item.id === projectId);
    const assignee = defaultTeam.find((member) => member.id === selectedAssigneeId);
    const taskTitle =
      newTaskTitle.trim() ||
      (project
        ? `NHAI field survey for ${project.code}`
        : "NHAI field survey task");
    const nextTask: Task = {
      id: crypto.randomUUID(),
      title: taskTitle,
      description: project ? `Survey coordination task for ${project.code}` : "NHAI survey coordination task",
      projectId,
      assigneeId: selectedAssigneeId,
      status: "To Do",
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      createdAt: new Date().toISOString().slice(0, 10),
      tags: ["nhai", "survey"],
    };

    const nextTasks = [nextTask, ...tasks];

    syncTasks(nextTasks);
    setFieldMemberId(selectedAssigneeId);

    const nextProjects = projects.map((item) => {
      if (item.id !== projectId || item.teamIds.includes(selectedAssigneeId)) {
        return item;
      }

      return { ...item, teamIds: [...item.teamIds, selectedAssigneeId] };
    });

    saveStoredProjects(nextProjects);
    setProjects(nextProjects);
    persistRemoteWorkspace(nextProjects, nextTasks, fieldUpdates);
    clearTaskForm();
    flashMessage(`Task added for ${assignee?.name ?? "field team"}`);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="NHAI Project Management"
        description="Coordinate NHAI survey allocation from Projects and give the field team a simple mobile workflow for daily execution."
      >
        <Button variant="outline" onClick={() => exportCsv(filteredProjects, tasks, fieldUpdates)}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Link href="/projects">
          <Button>
            <FolderKanban className="h-4 w-4" />
            Projects
          </Button>
        </Link>
      </PageHeader>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("coordinator")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "coordinator"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Coordinator Dashboard
          </button>
          <button
            type="button"
            onClick={() => setMode("field")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "field"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Field Team View
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {saveMessage}
        </div>
      )}

      {mode === "coordinator" ? (
        <CoordinatorDashboard
          nhaiProjects={nhaiProjects}
          filteredProjects={filteredProjects}
          tasks={tasks}
          activeProjectId={activeProjectId}
          search={search}
          setSearch={setSearch}
          selectedAssigneeId={selectedAssigneeId}
          setSelectedAssigneeId={setSelectedAssigneeId}
          setSelectedProjectId={setSelectedProjectId}
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          newTaskDueDate={newTaskDueDate}
          setNewTaskDueDate={setNewTaskDueDate}
          newTaskPriority={newTaskPriority}
          setNewTaskPriority={setNewTaskPriority}
          openTaskCount={openTaskCount}
          overdueTaskCount={overdueTaskCount}
          assignedProjectCount={assignedProjectCount}
          averageProgress={averageProgress}
          assignTask={assignTask}
          fieldUpdates={fieldUpdates}
        />
      ) : (
        <FieldTeamView
          fieldMemberId={fieldMemberId}
          setFieldMemberId={setFieldMemberId}
          tasks={todayTasks}
          projects={nhaiProjects}
          fieldUpdates={fieldUpdates}
          updateFieldStatus={updateFieldStatus}
          updateFieldForm={updateFieldForm}
          deleteFieldTask={deleteFieldTask}
        />
      )}
    </div>
  );
}

function CoordinatorDashboard({
  nhaiProjects,
  filteredProjects,
  tasks,
  activeProjectId,
  search,
  setSearch,
  selectedAssigneeId,
  setSelectedAssigneeId,
  setSelectedProjectId,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskPriority,
  setNewTaskPriority,
  openTaskCount,
  overdueTaskCount,
  assignedProjectCount,
  averageProgress,
  assignTask,
  fieldUpdates,
}: {
  nhaiProjects: Project[];
  filteredProjects: Project[];
  tasks: Task[];
  activeProjectId: string;
  search: string;
  setSearch: (value: string) => void;
  selectedAssigneeId: string;
  setSelectedAssigneeId: (value: string) => void;
  setSelectedProjectId: (value: string) => void;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (value: string) => void;
  newTaskPriority: TaskPriority | "";
  setNewTaskPriority: (value: TaskPriority | "") => void;
  openTaskCount: number;
  overdueTaskCount: number;
  assignedProjectCount: number;
  averageProgress: number;
  assignTask: (projectId?: string) => void;
  fieldUpdates: FieldUpdate[];
}) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="NHAI Projects" value={nhaiProjects.length} icon={MapPinned} tone="indigo" hint="From Projects" index={0} />
        <StatCard label="Allocated" value={assignedProjectCount} icon={Users} tone="emerald" hint="With assigned team" index={1} />
        <StatCard label="Open Tasks" value={openTaskCount} icon={ClipboardList} tone="amber" hint={`${overdueTaskCount} overdue`} index={2} />
        <StatCard label="Avg Progress" value={`${averageProgress}%`} icon={CheckCircle2} tone="rose" hint="Across NHAI portfolio" index={3} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Coordination</h2>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search UPC, PIU, project..."
              className="h-9 pl-9 text-xs"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Project List</h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              {filteredProjects.length} shown
            </span>
          </div>
          <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
            {filteredProjects.map((project) => (
              <CoordinatorProjectCard
                key={project.id}
                project={project}
                activeProjectId={activeProjectId}
                setSelectedProjectId={setSelectedProjectId}
                tasks={tasks.filter((task) => task.projectId === project.id)}
                fieldUpdates={fieldUpdates}
                selectedAssigneeId={selectedAssigneeId}
                setSelectedAssigneeId={setSelectedAssigneeId}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newTaskDueDate={newTaskDueDate}
                setNewTaskDueDate={setNewTaskDueDate}
                newTaskPriority={newTaskPriority}
                setNewTaskPriority={setNewTaskPriority}
                assignTask={assignTask}
              />
            ))}

            {filteredProjects.length === 0 && <NhaiEmptyState />}
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectCoordinationDetail({
  project,
  projectTasks,
  fieldUpdates,
  selectedAssigneeId,
  setSelectedAssigneeId,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskPriority,
  setNewTaskPriority,
  assignTask,
}: {
  project: Project;
  projectTasks: Task[];
  fieldUpdates: FieldUpdate[];
  selectedAssigneeId: string;
  setSelectedAssigneeId: (value: string) => void;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (value: string) => void;
  newTaskPriority: TaskPriority | "";
  setNewTaskPriority: (value: TaskPriority | "") => void;
  assignTask: (projectId?: string) => void;
}) {
  const contact = extractProjectContact(project);
  const uploadedCount = projectTasks.filter((task) => {
    const update = fieldUpdates.find((item) => item.taskId === task.id);
    return fieldStatusFromTask(task, update) === "Data Uploaded";
  }).length;
  const fieldActiveCount = projectTasks.filter((task) => {
    const update = fieldUpdates.find((item) => item.taskId === task.id);
    const status = fieldStatusFromTask(task, update);
    return status === "Travelling" || status === "On Site" || status === "Survey Done";
  }).length;
  const pendingCount = projectTasks.filter((task) => {
    const update = fieldUpdates.find((item) => item.taskId === task.id);
    return fieldStatusFromTask(task, update) === "Not Started";
  }).length;

  return (
    <div className="mx-4 mb-4 ml-5 mt-4 space-y-4 border-t border-slate-200 pt-4">
      <div className="grid gap-3 text-xs sm:grid-cols-3">
        <InfoPill label="PIU" value={contact.piu || "Not set"} />
        <InfoPill label="Work Order" value={contact.workOrder || "Not set"} />
        <InfoPill label="Progress" value={`${project.progress}%`} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill label="Pending" value={`${pendingCount}`} />
        <InfoPill label="In Field" value={`${fieldActiveCount}`} />
        <InfoPill label="Uploaded" value={`${uploadedCount}`} />
      </div>

      <div className="rounded-xl border border-indigo-200 bg-white p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h4 className="text-base font-bold text-slate-900">New Field Task</h4>
          </div>
          <Button
            onClick={() => assignTask(project.id)}
            disabled={!project.id || !selectedAssigneeId || !newTaskDueDate || !newTaskPriority}
            className="h-10 shrink-0 bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {quickTaskTemplates.map((template) => (
            <button
              key={template}
              type="button"
              onClick={() => setNewTaskTitle(`${template} for ${project.code}`)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {template}
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_0.8fr_0.7fr]">
          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            Work
            <Input
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder={`Field work for ${project.code}`}
              className="h-10 text-sm normal-case tracking-normal"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            Field Person
            <select
              value={selectedAssigneeId}
              onChange={(event) => setSelectedAssigneeId(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none"
            >
              <option value="" disabled>
                Select field person
              </option>
              {defaultTeam.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            Due Date
            <Input
              type="date"
              value={newTaskDueDate}
              onChange={(event) => setNewTaskDueDate(event.target.value)}
              className="h-10 text-sm normal-case tracking-normal"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            Priority
            <select
              value={newTaskPriority}
              onChange={(event) => setNewTaskPriority(event.target.value as TaskPriority | "")}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none"
            >
              <option value="" disabled>
                Select priority
              </option>
              {taskPriorities.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Task List</h4>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {projectTasks.length} task{projectTasks.length !== 1 ? "s" : ""}
          </span>
        </div>
        <TaskAllocationPanel
          projectTasks={projectTasks}
          fieldUpdates={fieldUpdates}
        />
      </div>
    </div>
  );
}

function CoordinatorProjectCard({
  project,
  activeProjectId,
  setSelectedProjectId,
  tasks,
  fieldUpdates,
  selectedAssigneeId,
  setSelectedAssigneeId,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskPriority,
  setNewTaskPriority,
  assignTask,
}: {
  project: Project;
  activeProjectId: string;
  setSelectedProjectId: (value: string) => void;
  tasks: Task[];
  fieldUpdates: FieldUpdate[];
  selectedAssigneeId: string;
  setSelectedAssigneeId: (value: string) => void;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (value: string) => void;
  newTaskPriority: TaskPriority | "";
  setNewTaskPriority: (value: TaskPriority | "") => void;
  assignTask: (projectId?: string) => void;
}) {
  const contact = extractProjectContact(project);
  const openTasks = tasks.filter((task) => task.status !== "Done").length;
  const latestTask = tasks[0];
  const latestUpdate = latestTask
    ? fieldUpdates.find((item) => item.taskId === latestTask.id)
    : undefined;
  const isSelected = project.id === activeProjectId;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition hover:border-slate-400 hover:shadow-md ${
        isSelected
          ? "border-indigo-500 ring-4 ring-indigo-100"
          : "border-slate-300"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1.5 ${
          isSelected ? "bg-indigo-600" : "bg-slate-300"
        }`}
      />
      <button
        type="button"
        onClick={() => setSelectedProjectId(project.id)}
        className="block w-full px-4 py-3 pl-5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">
              {project.code}
            </span>
            <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-950">{project.name}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">{project.location}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
              {openTasks} open
            </span>
            <StatusBadge status={project.status} />
            {isSelected && (
              <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white">
                Selected
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="mx-4 mb-4 ml-5 grid gap-2 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-600 sm:grid-cols-3">
        <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          PIU: {contact.piu || "Not set"}
        </span>
        <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          Progress: {project.progress}%
        </span>
        {latestTask && (
          <span className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-700">
            Field: {surveyorStatusLabel(latestUpdate)}
          </span>
        )}
      </div>
      {isSelected && (
        <ProjectCoordinationDetail
          project={project}
          projectTasks={tasks}
          fieldUpdates={fieldUpdates}
          selectedAssigneeId={selectedAssigneeId}
          setSelectedAssigneeId={setSelectedAssigneeId}
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          newTaskDueDate={newTaskDueDate}
          setNewTaskDueDate={setNewTaskDueDate}
          newTaskPriority={newTaskPriority}
          setNewTaskPriority={setNewTaskPriority}
          assignTask={assignTask}
        />
      )}
    </article>
  );
}

function TaskAllocationPanel({
  projectTasks,
  fieldUpdates,
}: {
  projectTasks: Task[];
  fieldUpdates: FieldUpdate[];
}) {
  return (
    <div className="max-h-[440px] space-y-3 overflow-y-auto pr-1">
      {projectTasks.map((task) => {
        const dueDays = daysUntil(task.dueDate);
        const update = fieldUpdates.find((item) => item.taskId === task.id);
        const assignee = defaultTeam.find((member) => member.id === task.assigneeId);

        return (
          <article key={task.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">{task.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Due {formatDate(task.dueDate)} {dueDays < 0 && task.status !== "Done" ? `(${Math.abs(dueDays)}d overdue)` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {taskTypeFromTask(task)}
                </span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {surveyorStatusLabel(update)}
                </span>
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <InfoPill label="Field Person" value={assignee?.name ?? "Unassigned"} />
              <InfoPill label="Surveyor Status" value={surveyorStatusLabel(update)} />
              <InfoPill label="Priority" value={task.priority} />
            </div>
            {(update?.workDone || update?.chainageCovered || update?.issue || update?.nextAction) && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                <p className="font-bold">Latest field update</p>
                {update.workDone && <p className="mt-1">Work: {update.workDone}</p>}
                {update.chainageCovered && <p className="mt-1">Chainage: {update.chainageCovered}</p>}
                {update.issue && <p className="mt-1 text-amber-800">Issue: {update.issue}</p>}
                {update.nextAction && <p className="mt-1">Next: {update.nextAction}</p>}
              </div>
            )}
          </article>
        );
      })}

      {projectTasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No assigned work yet.
        </div>
      )}
    </div>
  );
}

function FieldTeamView({
  fieldMemberId,
  setFieldMemberId,
  tasks,
  projects,
  fieldUpdates,
  updateFieldStatus,
  updateFieldForm,
  deleteFieldTask,
}: {
  fieldMemberId: string;
  setFieldMemberId: (value: string) => void;
  tasks: Task[];
  projects: Project[];
  fieldUpdates: FieldUpdate[];
  updateFieldStatus: (task: Task, status: FieldStatus) => void;
  updateFieldForm: (task: Task, patch: Partial<FieldUpdate>) => void;
  deleteFieldTask: (task: Task) => void;
}) {
  const currentMember = defaultTeam.find((member) => member.id === fieldMemberId);
  const overdueCount = tasks.filter((task) => daysUntil(task.dueDate) < 0 && task.status !== "Done").length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Field Team</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{currentMember?.name ?? "Field member"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {tasks.length} active task{tasks.length !== 1 ? "s" : ""}{overdueCount ? `, ${overdueCount} overdue` : ""}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:w-80">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              View tasks for
            </label>
            <select
              value={fieldMemberId}
              onChange={(event) => setFieldMemberId(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none"
            >
              {defaultTeam.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {tasks.map((task) => {
          const project = projects.find((item) => item.id === task.projectId);
          const update = fieldUpdates.find((item) => item.taskId === task.id);

          if (!project) return null;

          return (
            <FieldTaskCard
              key={task.id}
              task={task}
              project={project}
              update={update}
              updateFieldStatus={updateFieldStatus}
              updateFieldForm={updateFieldForm}
              deleteFieldTask={deleteFieldTask}
            />
          );
        })}
      </section>

      {tasks.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-soft">
          <UserRound className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">No field tasks assigned</h3>
          <p className="mt-1 text-sm text-slate-500">
            Ask the coordinator to allocate NHAI survey tasks to this field user.
          </p>
        </div>
      )}
    </div>
  );
}

function FieldTaskCard({
  task,
  project,
  update,
  updateFieldStatus,
  updateFieldForm,
  deleteFieldTask,
}: {
  task: Task;
  project: Project;
  update?: FieldUpdate;
  updateFieldStatus: (task: Task, status: FieldStatus) => void;
  updateFieldForm: (task: Task, patch: Partial<FieldUpdate>) => void;
  deleteFieldTask: (task: Task) => void;
}) {
  const fieldStatus = fieldStatusFromTask(task, update);
  const assignee = defaultTeam.find((member) => member.id === task.assigneeId);
  const contact = extractProjectContact(project);
  const taskType = taskTypeFromTask(task);
  const phone = cleanPhone(contact.pdMobile || contact.aeIeContact || assignee?.phone || "");
  const dueDays = daysUntil(task.dueDate);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{taskType}</p>
          <h3 className="mt-1 truncate text-xl font-bold text-slate-900">{project.code}</h3>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">{project.name}</p>
          <p className="mt-2 text-sm text-slate-500">{project.location}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
              dueDays < 0 && task.status !== "Done"
                ? "bg-rose-100 text-rose-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {dueDays < 0 && task.status !== "Done" ? `${Math.abs(dueDays)}d overdue` : formatDate(task.dueDate)}
          </span>
          <button
            type="button"
            onClick={() => deleteFieldTask(task)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
            title="Delete field task"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <InfoPill label="PIU" value={contact.piu || "Not available"} />
        <InfoPill label="Contact" value={contact.pdName || contact.aeIeName || "Project contact"} />
        <InfoPill label="Chainage" value={update?.chainageCovered || "Not updated"} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <a
          href={googleMapsUrl(project)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <Navigation className="h-4 w-4" />
          Map
        </a>
        <a
          href={phone ? `tel:${phone}` : undefined}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold ${
            phone
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "pointer-events-none bg-slate-100 text-slate-400"
          }`}
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <button
          type="button"
          onClick={() => updateFieldStatus(task, "Travelling")}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Start
        </button>
        <button
          type="button"
          onClick={() => updateFieldStatus(task, "Data Uploaded")}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Complete
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <h4 className="text-sm font-bold text-slate-900">Field Update</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
            <select
              value={fieldStatus}
              onChange={(event) => updateFieldStatus(task, event.target.value as FieldStatus)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none"
            >
              {fieldStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            Chainage
            <Input
              value={update?.chainageCovered ?? ""}
              onChange={(event) => updateFieldForm(task, { chainageCovered: event.target.value })}
              placeholder="Example: 12+500 to 18+000"
              className="bg-white normal-case tracking-normal"
            />
          </label>
        </div>

        <label className="mt-3 grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          Today Update
          <textarea
            value={update?.workDone ?? ""}
            onChange={(event) => updateFieldForm(task, { workDone: event.target.value })}
            placeholder="Work done today"
            className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="mt-3 grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          Issue
          <Input
            value={update?.issue ?? ""}
            onChange={(event) => updateFieldForm(task, { issue: event.target.value })}
            placeholder="No issue"
            className="bg-white normal-case tracking-normal"
          />
        </label>
        <p className="mt-3 text-xs font-semibold text-emerald-700">
          Saved on device{update?.updatedAt ? ` at ${new Date(update.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
        </p>
      </div>
    </article>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 line-clamp-2 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function NhaiEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      <FolderKanban className="mx-auto h-10 w-10 text-slate-300" />
      <h3 className="mt-3 text-sm font-semibold text-slate-900">No NHAI projects found</h3>
      <p className="mt-1 text-sm text-slate-500">
        Import NHAI Excel from Projects page, then return here to allocate survey tasks.
      </p>
      <Link
        href="/projects"
        className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Go to Projects
      </Link>
    </div>
  );
}
