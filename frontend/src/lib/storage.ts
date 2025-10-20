// frontend/src/lib/storage.ts
import type { Task } from "../types";
import * as api from "./api"; // <-- фикс: было { api }, стало namespace import

export function storageBackendName(): string {
  return "server";
}

// ---- Основные операции ----

export async function listTasks(weekStart: string): Promise<Task[]> {
  return api.get<Task[]>("/tasks", { weekStart });
}

export async function createTask(input: {
  title: string;
  targetMinutes: number;
  weekStart: string;
}): Promise<Task> {
  return api.post<Task>("/tasks", input);
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "targetMinutes">>
): Promise<Task> {
  return api.patch<Task>(`/tasks/${id}`, patch);
}

export async function logTime(id: string, minutes: number): Promise<Task> {
  return api.post<Task>(`/tasks/${id}/log`, { minutes });
}

export async function deleteTask(id: string): Promise<{ ok: true }> {
  return api.del<{ ok: true }>(`/tasks/${id}`);
}

// ---- Совместимость со старым API ----

export const keyFor = () => "server";

export async function loadTasks(_tgId: string, weekStart: string): Promise<Task[]> {
  return listTasks(weekStart);
}

export async function saveTasks(_tgId: string, _tasks: Task[]): Promise<void> {
  return;
}

export async function clearAll(_tgId: string) {
  await api.post<{ ok: true }>("/danger/delete-account");
}

// CloudStorage больше не используем
export const cloudAvailable = () => false;
export const cloudLoadTasks = async () => null;
export const cloudSaveTasks = async () => {};