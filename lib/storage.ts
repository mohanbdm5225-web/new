const PREFIX = "geosurvey:";

export function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

export function storageRemove(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PREFIX + key);
}

export function storageClear(): void {
  if (typeof window === "undefined") return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => window.localStorage.removeItem(k));
}