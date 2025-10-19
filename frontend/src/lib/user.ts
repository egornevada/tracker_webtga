// src/lib/user.ts
export function getTgId(): string {
  const tg = (window as any)?.Telegram?.WebApp;
  // В Telegram Mini App тут будет реальный id. В браузере — подставим "guest"
  return tg?.initDataUnsafe?.user?.id?.toString?.() ?? "guest";
}

export function getTgUsername(): string | null {
  const tg = (window as any)?.Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.username ?? null;
}