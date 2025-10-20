import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";

// ВАЖНО: .js в относительных путях для ESM/NodeNext
import { telegramAuth } from "./auth/telegram.js";
import tasksRouter from "./routes/tasks.js";
import type { Request, Response, NextFunction } from "express";

const app = express();
const PORT = Number(process.env.PORT || 3000);

// ===== CORS =====
const allow = String(process.env.ALLOW_ORIGINS ?? process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Postman/curl
      if (allow.includes(origin)) return cb(null, true);
      cb(new Error("CORS blocked"));
    },
    credentials: false,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-telegram-init-data"],
  })
);

// ===== Security headers =====
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP отдаёт фронт через Nginx
    crossOriginEmbedderPolicy: false,
  })
);

app.set("trust proxy", true);
app.use(express.json());

// Health (публичный)
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Ниже — приватные роуты (все требуют Telegram initData)
app.use(telegramAuth({ allowDev: true })); // allowDev=true — удобно на локалке

// Кто я
app.get("/me", (req, res) => {
  res.json({ tgId: req.user!.tgId.toString(), username: req.user!.username });
});

// Задачи
app.use("/tasks", tasksRouter);

// Удалить аккаунт (вынесено на корень API)
app.post("/danger/delete-account", async (req, res) => {
  const { prisma } = await import("./prisma.js");
  const dbUser = await prisma.user.findUnique({ where: { tgId: String(req.user!.tgId) } });
  if (!dbUser) return res.json({ ok: true });
  await prisma.user.delete({ where: { id: dbUser.id } });
  res.json({ ok: true });
});

// Глобальный обработчик ошибок
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(PORT, () => {
  console.log(`[api] up on :${PORT}`);
});