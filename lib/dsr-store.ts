export type DsrEntry = {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  reportedById: string;
  reportedByName: string;
  workType: string;
  location: string;
  progress: number;
  workDone: string;
  issues: string;
  nextPlan: string;
  createdAt: string;
};

export const DSR_STORAGE_KEY = "geo_dsr_entries";

export const defaultDsrEntries: DsrEntry[] = [
  {
    id: "dsr1",
    date: "2026-04-25",
    projectId: "p1",
    projectName: "Chennai Metro Phase-III Corridor Survey",
    reportedById: "u2",
    reportedByName: "Arvind Kumar",
    workType: "DGPS Survey",
    location: "Chennai",
    progress: 62,
    workDone:
      "Completed DGPS observation for corridor segment B and verified control point consistency.",
    issues: "Traffic restriction delayed two control point observations.",
    nextPlan: "Continue topographic survey for Chainage 16-24 km.",
    createdAt: "2026-04-25T09:00:00",
  },
  {
    id: "dsr2",
    date: "2026-04-24",
    projectId: "p2",
    projectName: "NH-544 Highway LiDAR Mapping",
    reportedById: "u4",
    reportedByName: "Vikram Sethu",
    workType: "LiDAR",
    location: "Salem–Kochi",
    progress: 38,
    workDone:
      "Completed LiDAR flight plan validation and field reconnaissance for Block 2.",
    issues: "Weather condition not suitable for afternoon flying.",
    nextPlan: "Resume LiDAR acquisition early morning.",
    createdAt: "2026-04-24T09:00:00",
  },
];

export function getDsrEntries(): DsrEntry[] {
  if (typeof window === "undefined") return defaultDsrEntries;

  const stored = window.localStorage.getItem(DSR_STORAGE_KEY);

  if (!stored) {
    window.localStorage.setItem(
      DSR_STORAGE_KEY,
      JSON.stringify(defaultDsrEntries)
    );
    return defaultDsrEntries;
  }

  try {
    return JSON.parse(stored) as DsrEntry[];
  } catch {
    window.localStorage.setItem(
      DSR_STORAGE_KEY,
      JSON.stringify(defaultDsrEntries)
    );
    return defaultDsrEntries;
  }
}

export function saveDsrEntry(entry: DsrEntry) {
  const current = getDsrEntries();
  const updated = [entry, ...current];

  window.localStorage.setItem(DSR_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("dsr-updated"));
}

export function deleteDsrEntry(id: string) {
  const current = getDsrEntries();
  const updated = current.filter((entry) => entry.id !== id);

  window.localStorage.setItem(DSR_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("dsr-updated"));
}