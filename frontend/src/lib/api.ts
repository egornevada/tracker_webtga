// frontend/src/lib/api.ts
type Method = "GET" | "POST" | "PATCH" | "DELETE";

function buildUrl(path: string) {
  return `/api${path}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
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

export const api = {
  get:  <T>(path: string, params?: Record<string, string | number | boolean>) =>
    request<T>(
      params
        ? `${path}?${new URLSearchParams(
            Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
          ).toString()}`
        : path,
      { method: "GET" as Method }
    ),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST" as Method, body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH" as Method, body: body ? JSON.stringify(body) : undefined }),

  del:  <T>(path: string) =>
    request<T>(path, { method: "DELETE" as Method }),
};
