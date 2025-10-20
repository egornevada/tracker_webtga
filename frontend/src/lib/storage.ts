// frontend/src/lib/storage.ts
import type { Task } from "../types";

/** ====== Telegram initData ====== */
function tgInitData(): string {
  const w: any = window as any;
  return (
    w?.Telegram?.WebApp?.initData ??
    w?.Telegram?.WebApp?.initDataUnsafe?._auth ??
    ""
  );
}

/** ====== Синхронный запрос к нашему API (/api/...) ====== */
function requestSync<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
  params?: Record<string, string>
): T {
  let url = `/api${path}`;
  if (params && Object.keys(params).length) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  const xhr = new XMLHttpRequest();
  xhr.open(method, url, false); // СИНХРОННО!

  const initData = tgInitData();
  if (initData) xhr.setRequestHeader("x-telegram-init-data", initData);
  if (method !== "GET") xhr.setRequestHeader("Content-Type", "application/json");

  try {
    xhr.send(body ? JSON.stringify(body) : null);
  } catch (e) {
    throw new Error(`API network error: ${String(e)}`);
  }

  if (xhr.status < 200 || xhr.status >= 300) {
    throw new Error(`API ${xhr.status}: ${xhr.responseText || xhr.statusText}`);
  }

  try {
    return JSON.parse(xhr.responseText) as T;
  } catch {
    return (xhr.responseText ? JSON.parse(xhr.responseText) : {}) as T;
  }
}

export function storageBackendName(): string {
  return "server-sync";
}

/** ====== Совместимые синхронные сигнатуры (оверлоады) ====== */
// loadTasks раньше вызывали и как loadTasks(weekStart), и как loadTasks(tgId, weekStart)
export function loadTasks(weekStart: string): Task[];
export function loadTasks(_tgId: string, weekStart: string): Task[];
export function loadTasks(a: string, b?: string): Task[] {
  const weekStart = b ?? a; // если пришёл 1 аргумент — это weekStart
  return requestSync<Task[]>("/tasks", "GET", undefined, { weekStart });
}

// saveTasks встречался как saveTasks(tasks) и saveTasks(tgId, tasks) — делаем no-op
export function saveTasks(tasks: Task[]): void;
export function saveTasks(_tgId: string, tasks: Task[]): void;
export function saveTasks(_a: string | Task[], _b?: Task[]): void {
  // Ничего не делаем — все изменения идут через create/update/log/delete
}

// совместимые хелперы
export function createTask(input: {
  title: string;
  targetMinutes: number;
  weekStart: string;
}): Task {
  return requestSync<Task>("/tasks", "POST", input);
}

export function updateTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "targetMinutes">>
): Task {
  return requestSync<Task>(`/tasks/${id}`, "PATCH", patch);
}

export function logTime(id: string, minutes: number): Task {
  return requestSync<Task>(`/tasks/${id}/log`, "POST", { minutes });
}

export function deleteTask(id: string): { ok: true } {
  return requestSync<{ ok: true }>(`/tasks/${id}`, "DELETE");
}

// clearAll могли звать и с tgId и без — делаем оба варианта
export function clearAll(): void;
export function clearAll(_tgId?: string): void;
export function clearAll(_tgId?: string): void {
  try { requestSync<{ ok: true }>(`/danger/delete-account`, "POST"); } catch {}
}

// CloudStorage не используем
export const cloudAvailable = () => false;
export const cloudLoadTasks = async () => null;
export const cloudSaveTasks = async () => {};
