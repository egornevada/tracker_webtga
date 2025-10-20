import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import type { AuthedUser } from "../types.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

function validateInitData(initData: string): { ok: boolean; data?: URLSearchParams } {
  try {
    const urlsp = new URLSearchParams(initData);
    const hash = urlsp.get("hash");
    if (!hash) return { ok: false };

    const dataCheckString = [...urlsp.entries()]
      .filter(([k]) => k !== "hash")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const secret = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
    const calc = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
    if (calc !== hash) return { ok: false };

    return { ok: true, data: urlsp };
  } catch {
    return { ok: false };
  }
}

export function telegramAuth({ allowDev = false }: { allowDev?: boolean } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const initData = req.header("x-telegram-init-data") || "";
    const { ok, data } = validateInitData(initData);

    if (!ok || !data) {
      if (allowDev && process.env.NODE_ENV !== "production") {
        req.user = { tgId: BigInt(999), username: "dev_user" } as AuthedUser;
        return next();
      }
      return res.status(401).send("Invalid Telegram initData");
    }

    const raw = data.get("user");
    const parsed = raw ? JSON.parse(raw) : null;
    const tgId = parsed?.id;
    if (!tgId) return res.status(401).send("No user in initData");

    req.user = {
      tgId: BigInt(tgId),
      username: parsed?.username || null,
    };
    next();
  };
}