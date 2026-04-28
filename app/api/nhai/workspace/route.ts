import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { projects as defaultProjects, tasks as defaultTasks } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { Project, Task, TaskStatus } from "@/lib/types";

export const runtime = "nodejs";

type FieldStatus =
  | "Not Started"
  | "Travelling"
  | "On Site"
  | "Survey Done"
  | "Data Uploaded"
  | "Issue Found";

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

type NhaiWorkspace = {
  projects: Project[];
  tasks: Task[];
  updates: FieldUpdate[];
};

type NhaiProjectRow = {
  id: string;
  code: string;
  name: string;
  client: string;
  type: Project["type"];
  status: Project["status"];
  priority: Project["priority"];
  progress: number;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  description: string;
  location: string;
  manager_id: string;
  team_ids: string[];
  latitude: number | null;
  longitude: number | null;
};

type NhaiTaskRow = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assignee_id: string;
  status: TaskStatus;
  priority: Task["priority"];
  due_date: string;
  created_at: string;
  tags: string[];
};

type NhaiFieldUpdateRow = {
  task_id: string;
  project_id: string;
  status: FieldStatus;
  work_done: string;
  chainage_covered: string;
  drone_completed: boolean;
  gcp_completed: boolean;
  issue: string;
  next_action: string;
  attachment_name: string;
  saved_offline: boolean;
  updated_at: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const dataPath = path.join(process.cwd(), ".data", "nhai-workspace.json");

function isNhaiProject(project: Project) {
  return project.client.toLowerCase() === "nhai";
}

function defaultWorkspace(): NhaiWorkspace {
  const projects = defaultProjects.filter(isNhaiProject);
  const projectIds = new Set(projects.map((project) => project.id));

  return {
    projects,
    tasks: defaultTasks.filter((task) => projectIds.has(task.projectId)),
    updates: [],
  };
}

function taskStatusFromFieldStatus(status: FieldStatus): TaskStatus {
  if (status === "Data Uploaded") return "Done";
  if (status === "Survey Done") return "Review";
  if (status === "Travelling" || status === "On Site" || status === "Issue Found") {
    return "In Progress";
  }

  return "To Do";
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init?.headers,
    },
  });
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return fallback;
}

async function readWorkspace() {
  try {
    const stored = await readFile(dataPath, "utf8");
    const parsed = JSON.parse(stored) as Partial<NhaiWorkspace>;
    const fallback = defaultWorkspace();

    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : fallback.projects,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : fallback.tasks,
      updates: Array.isArray(parsed.updates) ? parsed.updates : fallback.updates,
    };
  } catch {
    return defaultWorkspace();
  }
}

async function writeWorkspace(workspace: NhaiWorkspace) {
  await mkdir(path.dirname(dataPath), { recursive: true });
  await writeFile(dataPath, JSON.stringify(workspace, null, 2));
}

function projectFromRow(row: NhaiProjectRow): Project {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    client: row.client,
    type: row.type,
    status: row.status,
    priority: row.priority,
    progress: row.progress,
    startDate: row.start_date,
    endDate: row.end_date,
    budget: row.budget,
    spent: row.spent,
    description: row.description,
    location: row.location,
    managerId: row.manager_id,
    teamIds: row.team_ids ?? [],
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  };
}

function projectToRow(project: Project): NhaiProjectRow {
  return {
    id: project.id,
    code: project.code,
    name: project.name,
    client: project.client,
    type: project.type,
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    start_date: project.startDate,
    end_date: project.endDate,
    budget: project.budget,
    spent: project.spent,
    description: project.description,
    location: project.location,
    manager_id: project.managerId,
    team_ids: project.teamIds,
    latitude: project.latitude ?? null,
    longitude: project.longitude ?? null,
  };
}

function taskFromRow(row: NhaiTaskRow): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    assigneeId: row.assignee_id,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    createdAt: row.created_at,
    tags: row.tags ?? [],
  };
}

function taskToRow(task: Task): NhaiTaskRow {
  return {
    id: task.id,
    project_id: task.projectId,
    title: task.title,
    description: task.description,
    assignee_id: task.assigneeId,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate,
    created_at: task.createdAt,
    tags: task.tags,
  };
}

function updateFromRow(row: NhaiFieldUpdateRow): FieldUpdate {
  return {
    taskId: row.task_id,
    projectId: row.project_id,
    status: row.status,
    workDone: row.work_done,
    chainageCovered: row.chainage_covered,
    droneCompleted: row.drone_completed,
    gcpCompleted: row.gcp_completed,
    issue: row.issue,
    nextAction: row.next_action,
    attachmentName: row.attachment_name,
    updatedAt: row.updated_at,
    savedOffline: row.saved_offline,
  };
}

function updateToRow(update: FieldUpdate): NhaiFieldUpdateRow {
  return {
    task_id: update.taskId,
    project_id: update.projectId,
    status: update.status,
    work_done: update.workDone,
    chainage_covered: update.chainageCovered,
    drone_completed: update.droneCompleted,
    gcp_completed: update.gcpCompleted,
    issue: update.issue,
    next_action: update.nextAction,
    attachment_name: update.attachmentName,
    saved_offline: update.savedOffline,
    updated_at: update.updatedAt,
  };
}

async function readSupabaseWorkspace(): Promise<NhaiWorkspace | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) return null;

  const [projectsResult, tasksResult, updatesResult] = await Promise.all([
    supabase.from("nhai_projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("nhai_tasks").select("*").order("due_date", { ascending: true }),
    supabase.from("nhai_field_updates").select("*").order("updated_at", { ascending: false }),
  ]);

  if (projectsResult.error) throw projectsResult.error;
  if (tasksResult.error) throw tasksResult.error;
  if (updatesResult.error) throw updatesResult.error;

  if (!projectsResult.data?.length) {
    return writeSupabaseWorkspace(defaultWorkspace());
  }

  return {
    projects: (projectsResult.data ?? []).map((row) => projectFromRow(row as NhaiProjectRow)),
    tasks: (tasksResult.data ?? []).map((row) => taskFromRow(row as NhaiTaskRow)),
    updates: (updatesResult.data ?? []).map((row) => updateFromRow(row as NhaiFieldUpdateRow)),
  };
}

async function writeSupabaseWorkspace(workspace: NhaiWorkspace): Promise<NhaiWorkspace | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) return null;

  const projects = workspace.projects.map(projectToRow);
  const tasks = workspace.tasks.map(taskToRow);
  const updates = workspace.updates.map(updateToRow);
  const [existingTasksResult, existingUpdatesResult] = await Promise.all([
    supabase.from("nhai_tasks").select("id"),
    supabase.from("nhai_field_updates").select("task_id"),
  ]);

  if (existingTasksResult.error) throw existingTasksResult.error;
  if (existingUpdatesResult.error) throw existingUpdatesResult.error;

  const nextTaskIds = new Set(tasks.map((task) => task.id));
  const taskIdsToDelete = (existingTasksResult.data ?? [])
    .map((row) => row.id as string)
    .filter((id) => !nextTaskIds.has(id));
  const nextUpdateTaskIds = new Set(updates.map((update) => update.task_id));
  const updateTaskIdsToDelete = (existingUpdatesResult.data ?? [])
    .map((row) => row.task_id as string)
    .filter((taskId) => !nextUpdateTaskIds.has(taskId));

  if (projects.length) {
    const { error } = await supabase.from("nhai_projects").upsert(projects);
    if (error) throw error;
  }

  if (tasks.length) {
    const { error } = await supabase.from("nhai_tasks").upsert(tasks);
    if (error) throw error;
  }

  if (updateTaskIdsToDelete.length) {
    const { error } = await supabase
      .from("nhai_field_updates")
      .delete()
      .in("task_id", updateTaskIdsToDelete);

    if (error) throw error;
  }

  if (taskIdsToDelete.length) {
    const { error } = await supabase.from("nhai_tasks").delete().in("id", taskIdsToDelete);

    if (error) throw error;
  }

  if (updates.length) {
    await Promise.all(
      updates.map(async (update) => {
        const { error } = await supabase
          .from("nhai_field_updates")
          .delete()
          .eq("task_id", update.task_id);

        if (error) throw error;
      })
    );

    const { error } = await supabase.from("nhai_field_updates").insert(updates);
    if (error) throw error;
  }

  return readSupabaseWorkspace();
}

function mergeUpdates(updates: FieldUpdate[], nextUpdate: FieldUpdate) {
  return [
    nextUpdate,
    ...updates.filter((update) => update.taskId !== nextUpdate.taskId),
  ].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

export async function GET() {
  try {
    const supabaseWorkspace = await readSupabaseWorkspace();

    if (supabaseWorkspace) return json(supabaseWorkspace);
  } catch (error) {
    return json(
      { error: errorMessage(error, "Unable to read Supabase workspace") },
      { status: 500 }
    );
  }

  return json(await readWorkspace());
}

export async function PUT(request: Request) {
  const current = await readWorkspace();
  const body = (await request.json()) as Partial<NhaiWorkspace>;
  const workspace: NhaiWorkspace = {
    projects: Array.isArray(body.projects) ? body.projects : current.projects,
    tasks: Array.isArray(body.tasks) ? body.tasks : current.tasks,
    updates: Array.isArray(body.updates) ? body.updates : current.updates,
  };

  try {
    const supabaseWorkspace = await writeSupabaseWorkspace(workspace);

    if (supabaseWorkspace) return json(supabaseWorkspace);
  } catch (error) {
    return json(
      { error: errorMessage(error, "Unable to save Supabase workspace") },
      { status: 500 }
    );
  }

  await writeWorkspace(workspace);

  return json(workspace);
}

export async function POST(request: Request) {
  const current = (await readSupabaseWorkspace()) ?? (await readWorkspace());
  const body = (await request.json()) as { update?: Partial<FieldUpdate> };
  const update = body.update;

  if (!update?.taskId || !update.projectId || !update.status) {
    return json(
      { error: "update.taskId, update.projectId, and update.status are required" },
      { status: 400 }
    );
  }

  const nextUpdate: FieldUpdate = {
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
  };
  const workspace = {
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === nextUpdate.taskId
        ? { ...task, status: taskStatusFromFieldStatus(nextUpdate.status) }
        : task
    ),
    updates: mergeUpdates(current.updates, nextUpdate),
  };

  try {
    const supabaseWorkspace = await writeSupabaseWorkspace(workspace);

    if (supabaseWorkspace) return json(supabaseWorkspace, { status: 201 });
  } catch (error) {
    return json(
      { error: errorMessage(error, "Unable to save Supabase field update") },
      { status: 500 }
    );
  }

  await writeWorkspace(workspace);

  return json(workspace, { status: 201 });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
