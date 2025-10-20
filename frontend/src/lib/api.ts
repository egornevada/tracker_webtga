// frontend/src/lib/api.ts
import type { Task } from "../types";

function buildUrl(path: string) {
  const base = "/api"; // Traefik/NGINX прокидывает /api на backend
  return `${base}${path}`;
}

function withQuery(
  path: string,
  params?: Record<string, string | number | boolean>
) {
  if (!params) return path;
  const q = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    )
  ).toString();
  return q ? `${path}?${q}` : path;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});

  // Передаём initData из Telegram WebApp для серверной аутентификации
  const initData =
    (window as any)?.Telegram?.WebApp?.initData ??
    (window as any)?.Telegram?.WebApp?.initDataUnsafe?._auth ??
    "";

  if (initData) headers.set("x-telegram-init-data", initData);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(buildUrl(path), {
    ...init,
    headers,
    credentials: "omit",
    cache: "no-cache",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${txt || res.statusText}`);
  }
  return (await res.json()) as T;
}

/* ================== НИЗКИЙ УРОВЕНЬ ================== */
export const get = <T>(
  path: string,
  params?: Record<string, string | number | boolean>
) => request<T>(withQuery(path, params), { method: "GET" });

export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

export const patch = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });

export const del = <T>(path: string) =>
  request<T>(path, { method: "DELETE" });

/* ================== ВЫСОКИЙ УРОВЕНЬ ================== */
export function getTasks(weekStart: string): Promise<Task[]> {
  return get<Task>("/tasks", { weekStart }) as unknown as Promise<Task[]>;
}

export function createTask(input: {
  title: string;
  targetMinutes: number;
  weekStart: string;
}): Promise<Task> {
  return post<Task>("/tasks", input);
}

export function patchTask(
  id: string,
  data: { title?: string; targetMinutes?: number }
): Promise<Task> {
  return patch<Task>(`/tasks/${encodeURIComponent(id)}`, data);
}

export function logTime(id: string, minutes: number): Promise<Task> {
  return post<Task>(`/tasks/${encodeURIComponent(id)}/log`, { minutes });
}

export function deleteTask(id: string): Promise<{ ok: true }> {
  return del<{ ok: true }>(`/tasks/${encodeURIComponent(id)}`);
}

export function deleteAccount(): Promise<{ ok: true }> {
  // маршрут вынесен в корень API
  return post<{ ok: true }>("/danger/delete-account");
}