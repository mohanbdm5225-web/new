import { Project } from "@/lib/types";
import { projects as defaultProjects } from "@/lib/mock-data";

export const PROJECT_STORAGE_KEY = "geo_projects";

export function getStoredProjects(): Project[] {
  if (typeof window === "undefined") return defaultProjects;

  const stored = window.localStorage.getItem(PROJECT_STORAGE_KEY);

  if (!stored) {
    window.localStorage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify(defaultProjects)
    );
    return defaultProjects;
  }

  try {
    return JSON.parse(stored) as Project[];
  } catch {
    window.localStorage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify(defaultProjects)
    );
    return defaultProjects;
  }
}

export function saveStoredProjects(projects: Project[]) {
  window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event("projects-updated"));
}

export function addStoredProjects(newProjects: Project[]) {
  const current = getStoredProjects();

  const filteredNewProjects = newProjects.filter((newProject) => {
    return !current.some(
      (existingProject) => existingProject.code === newProject.code
    );
  });

  saveStoredProjects([...filteredNewProjects, ...current]);

  return {
    imported: filteredNewProjects.length,
    skipped: newProjects.length - filteredNewProjects.length,
  };
}

export function deleteStoredProject(projectId: string) {
  const current = getStoredProjects();
  saveStoredProjects(current.filter((project) => project.id !== projectId));
}