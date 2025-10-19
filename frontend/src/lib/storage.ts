// src/lib/storage.ts
import type { Task } from "../types";

/** ===== Helpers: localStorage + in-memory ===== */

const memory = new Map<string, string>();

function canUseLocalStorage(): boolean {
  try {
    const test = "__ls_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function lsGet(key: string): string | null {
  if (canUseLocalStorage()) {
    try {
      return localStorage.getItem(key);
    } catch {}
  }
  return memory.get(key) ?? null;
}

function lsSet(key: string, value: string) {
  if (canUseLocalStorage()) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {}
  }
  memory.set(key, value);
}

function lsRemove(key: string) {
  if (canUseLocalStorage()) {
    try {
      localStorage.removeItem(key);
      return;
    } catch {}
  }
  memory.delete(key);
}

/** ===== Ключи ===== */

const APP_PREFIX = "trkr";
export const keyFor = (tgId: string) => `${APP_PREFIX}:tasks:${tgId || "guest"}`;

/** ===== Синхронное локальное API (как и было) ===== */

export function loadTasks(tgId: string): Task[] {
  const raw = lsGet(keyFor(tgId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tgId: string, tasks: Task[]) {
  lsSet(keyFor(tgId), JSON.stringify(tasks));
}

export function clearAll(tgId: string) {
  lsRemove(keyFor(tgId));
}

/** ===== Telegram CloudStorage (опционально) ===== */

type TgCloud = {
  getItem: (k: string, cb: (err: unknown, v: string | null) => void) => void;
  setItem: (k: string, v: string, cb: (err: unknown, ok: boolean) => void) => void;
};

function cloud(): TgCloud | null {
  const cs = (window as any)?.Telegram?.WebApp?.CloudStorage;
  if (cs && typeof cs.getItem === "function" && typeof cs.setItem === "function") {
    return cs as TgCloud;
  }
  return null;
}

export const cloudAvailable = () => !!cloud();

export function storageBackendName(): string {
  if (cloudAvailable()) return "cloud+local";
  if (canUseLocalStorage()) return "localStorage";
  return "memory";
}

// Асинхронная загрузка из CloudStorage
export function cloudLoadTasks(tgId: string): Promise<Task[] | null> {
  const c = cloud();
  if (!c) return Promise.resolve(null);
  const key = keyFor(tgId);
  return new Promise((resolve) => {
    c.getItem(key, (err, value) => {
      if (err) return resolve(null);
      if (!value) return resolve([]);
      try {
        const parsed = JSON.parse(value);
        resolve(Array.isArray(parsed) ? (parsed as Task[]) : []);
      } catch {
        resolve([]);
      }
    });
  });
}

// Асинхронное сохранение в CloudStorage
export function cloudSaveTasks(tgId: string, tasks: Task[]): Promise<void> {
  const c = cloud();
  if (!c) return Promise.resolve();
  const key = keyFor(tgId);
  const payload = JSON.stringify(tasks);
  return new Promise((resolve) => {
    c.setItem(key, payload, () => resolve());
  });
}