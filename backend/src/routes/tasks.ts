import { Router } from "express";
import { prisma } from "../prisma";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const r = Router();

const CreateTask = z.object({
  title: z.string().min(1).max(200),
  targetMinutes: z.number().int().min(1).max(100000),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const PatchTask = z.object({
  title: z.string().min(1).max(200).optional(),
  targetMinutes: z.number().int().min(1).max(100000).optional(),
});

const LogTime = z.object({
  minutes: z.number().int().min(-24 * 60).max(24 * 60),
});

// GET /tasks?weekStart=YYYY-MM-DD
r.get("/", async (req, res) => {
  const user = req.user!;
  const weekStart = String(req.query.weekStart || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return res.status(400).send("weekStart required");

  const dbUser = await prisma.user.upsert({
    where: { tgId: String(user.tgId) },
    create: { tgId: String(user.tgId), username: user.username || undefined },
    update: { username: user.username || undefined },
  });

  const tasks = await prisma.task.findMany({
    where: { userId: dbUser.id, weekStart },
    orderBy: { createdAt: "desc" },
  });

  res.json(tasks);
});

// POST /tasks
r.post("/", async (req, res) => {
  const user = req.user!;
  const parsed = CreateTask.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const dbUser = await prisma.user.upsert({
    where: { tgId: String(user.tgId) },
    create: { tgId: String(user.tgId), username: user.username || undefined },
    update: { username: user.username || undefined },
  });

  const task = await prisma.task.create({
    data: {
      userId: dbUser.id,
      title: parsed.data.title.trim(),
      weekStart: parsed.data.weekStart,
      targetMinutes: parsed.data.targetMinutes,
    },
  });

  res.json(task);
});

// PATCH /tasks/:id
r.patch("/:id", async (req, res) => {
  const user = req.user!;
  const parsed = PatchTask.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const task = await prisma.task.findFirst({
    where: { id: req.params.id, user: { tgId: String(user.tgId) } },
  });
  if (!task) return res.status(404).send("Not found");

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: parsed.data,
  });

  res.json(updated);
});

// POST /tasks/:id/log
r.post("/:id/log", async (req, res) => {
  const user = req.user!;
  const parsed = LogTime.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const task = await prisma.task.findFirst({
    where: { id: req.params.id, user: { tgId: String(user.tgId) } },
  });
  if (!task) return res.status(404).send("Not found");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.timeEntry.create({
      data: { taskId: task.id, minutes: parsed.data.minutes },
    });
    await tx.task.update({
      where: { id: task.id },
      data: { totalLogged: Math.max(0, task.totalLogged + parsed.data.minutes) },
    });
  });

  const fresh = await prisma.task.findUnique({ where: { id: task.id } });
  res.json(fresh);
});

// DELETE /tasks/:id
r.delete("/:id", async (req, res) => {
  const user = req.user!;
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, user: { tgId: String(user.tgId) } },
    select: { id: true },
  });
  if (!task) return res.status(404).send("Not found");

  await prisma.task.delete({ where: { id: task.id } });
  res.json({ ok: true });
});

// POST /danger/delete-account
r.post("/danger/delete-account", async (req, res) => {
  const user = req.user!;
  const dbUser = await prisma.user.findUnique({ where: { tgId: String(user.tgId) } });
  if (!dbUser) return res.json({ ok: true });

  await prisma.user.delete({ where: { id: dbUser.id } });
  res.json({ ok: true });
});

export default r;