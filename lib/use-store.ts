"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Project,
  Task,
  TeamMember,
  Equipment,
  Tender,
  FinanceRecord,
  DocumentItem,
} from "./types";
import {
  projects as seedProjects,
  tasks as seedTasks,
  team as seedTeam,
  equipment as seedEquipment,
  tenders as seedTenders,
  finance as seedFinance,
  documents as seedDocuments,
} from "./mock-data";
import { storageGet, storageSet } from "./storage";

const KEYS = {
  projects: "projects",
  tasks: "tasks",
  team: "team",
  equipment: "equipment",
  tenders: "tenders",
  finance: "finance",
  documents: "documents",
  initialized: "initialized",
} as const;

type EntityWithId = { id: string };

// ---------- Generic hook factory ----------
function createEntityHook<T extends EntityWithId>(
  storageKey: string,
  seedData: T[]
) {
  return function useEntity() {
    const [items, setItems] = useState<T[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
      const isInit = storageGet<boolean>(KEYS.initialized, false);
      if (!isInit) {
        // First time — seed all entities
        storageSet(KEYS.projects, seedProjects);
        storageSet(KEYS.tasks, seedTasks);
        storageSet(KEYS.team, seedTeam);
        storageSet(KEYS.equipment, seedEquipment);
        storageSet(KEYS.tenders, seedTenders);
        storageSet(KEYS.finance, seedFinance);
        storageSet(KEYS.documents, seedDocuments);
        storageSet(KEYS.initialized, true);
      }
      const data = storageGet<T[]>(storageKey, seedData);
      setItems(data);
      setLoaded(true);
    }, []);

    const persist = useCallback(
      (next: T[]) => {
        setItems(next);
        storageSet(storageKey, next);
      },
      []
    );

    const add = useCallback(
      (item: T) => {
        persist([item, ...items]);
      },
      [items, persist]
    );

    const update = useCallback(
      (id: string, patch: Partial<T>) => {
        persist(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
      },
      [items, persist]
    );

    const remove = useCallback(
      (id: string) => {
        persist(items.filter((it) => it.id !== id));
      },
      [items, persist]
    );

    const replaceAll = useCallback(
      (next: T[]) => {
        persist(next);
      },
      [persist]
    );

    return { items, loaded, add, update, remove, replaceAll };
  };
}

// ---------- Exported hooks ----------
export const useProjects = createEntityHook<Project>(KEYS.projects, seedProjects);
export const useTasks = createEntityHook<Task>(KEYS.tasks, seedTasks);
export const useTeam = createEntityHook<TeamMember>(KEYS.team, seedTeam);
export const useEquipment = createEntityHook<Equipment>(KEYS.equipment, seedEquipment);
export const useTenders = createEntityHook<Tender>(KEYS.tenders, seedTenders);
export const useFinance = createEntityHook<FinanceRecord>(KEYS.finance, seedFinance);
export const useDocuments = createEntityHook<DocumentItem>(KEYS.documents, seedDocuments);

// ---------- Reset all data ----------
export function resetAllData() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => {
    window.localStorage.removeItem("geosurvey:" + k);
  });
  window.location.reload();
}