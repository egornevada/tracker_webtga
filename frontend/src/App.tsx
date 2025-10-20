// src/App.tsx
import { useMemo, useState, useCallback, useEffect } from "react";
import { Box, Stack, Typography } from "@mui/material";

import Page from "./components/Page";
import HeroHeader from "./components/HeroHeader";
import TaskItem from "./components/TaskItem";
import AddTimeDialog from "./components/AddTimeDialog";
import EditTaskDialog from "./components/EditTaskDialog";
import SettingsDialog from "./components/SettingsDialog";

import { startOfISOWeek } from "./lib/week";
import type { Task } from "./types";

import { getTgId } from "./lib/user";
import * as api from "./lib/api";

function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addTimeFor, setAddTimeFor] = useState<string | null>(null);
  const [editFor, setEditFor] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openSettings, setOpenSettings] = useState(false);

  const backendName = "api";
  const [userKey] = useState<string>(() => getTgId());

  const weekStartISO = useMemo(() => {
    const d = startOfISOWeek(new Date());
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const list = await api.api.get<Task[]>("/tasks", { weekStart: weekStartISO });
        if (!canceled) setTasks(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        if (!canceled) setTasks([]);
      } finally {
        if (!canceled) {
          setAddTimeFor(null);
          setEditFor(null);
          setExpandedId(null);
        }
      }
    })();
    return () => { canceled = true; };
  }, [weekStartISO]);

  const handleCreateInHeader = useCallback(
    async ({ title, hours }: { title: string; hours: number }) => {
      const targetMinutes = Math.max(1, Math.round(Number(hours) * 60));
      try {
        const created = await api.api.post<Task>("/tasks", {
          title: title.trim(),
          targetMinutes,
          weekStart: weekStartISO,
        });
        setTasks((prev) => [created, ...prev]);
        setExpandedId(null);
      } catch (e) {
        console.error(e);
      }
    },
    [weekStartISO]
  );

  const addTime = useCallback(async (id: string, minutes: number) => {
    try {
      const updated = await api.api.post<Task>(`/tasks/${id}/log`, { minutes });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const editTask = useCallback(async (id: string, data: { title: string; targetMinutes: number }) => {
    try {
      const updated = await api.api.patch<Task>(`/tasks/${id}`, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await api.api.del<{ ok: true }>(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (addTimeFor === id) setAddTimeFor(null);
      if (editFor === id) setEditFor(null);
      if (expandedId === id) setExpandedId(null);
    } catch (e) {
      console.error(e);
    }
  }, [addTimeFor, editFor, expandedId]);

  const currentEdit = editFor ? tasks.find((t) => t.id === editFor) ?? null : null;

  return (
    <Page>
      <HeroHeader
        tasksCount={tasks.length}
        onCreateInHeader={handleCreateInHeader}
        onOpenSettings={() => setOpenSettings(true)}
      />

      {import.meta.env.DEV && (
        <Typography variant="caption" sx={{ opacity: 0.6, px: 2, display: "block" }}>
          storage: {userKey} · backend={backendName} · tasks={tasks.length}
        </Typography>
      )}

      <Box sx={{ p: 2, pt: 2 }}>
        <Stack spacing={2}>
          {tasks.length === 0 && (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Пока задач нет. Нажми «Создать новую задачу».
            </Typography>
          )}

          {tasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              expanded={expandedId === t.id}
              onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
              onAddTime={(id) => setAddTimeFor(id)}
              onEdit={(id) => setEditFor(id)}
            />
          ))}
        </Stack>
      </Box>

      <AddTimeDialog
        open={!!addTimeFor}
        onClose={() => setAddTimeFor(null)}
        onAdd={(m) => {
          if (addTimeFor) addTime(addTimeFor, m);
          setAddTimeFor(null);
        }}
      />

      <EditTaskDialog
        open={!!editFor}
        initial={
          currentEdit
            ? { title: currentEdit.title, targetMinutes: currentEdit.targetMinutes }
            : null
        }
        onClose={() => setEditFor(null)}
        onSave={(data) => {
          if (editFor) editTask(editFor, data);
          setEditFor(null);
        }}
        onDelete={() => {
          if (editFor) deleteTask(editFor);
          setEditFor(null);
        }}
      />

      <SettingsDialog
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        onDeleteAll={async () => {
          try { await api.api.post<{ ok: true }>("/danger/delete-account"); } catch (e) { console.error(e); }
          setTasks([]);
          setAddTimeFor(null);
          setEditFor(null);
          setExpandedId(null);
          setOpenSettings(false);
        }}
      />
    </Page>
  );
}

export default function App() {
  return <Home />;
}
