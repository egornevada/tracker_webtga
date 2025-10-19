// src/App.tsx
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Box, Stack, Typography } from "@mui/material";

import Page from "./components/Page";
import HeroHeader from "./components/HeroHeader";
import TaskItem from "./components/TaskItem";
import AddTimeDialog from "./components/AddTimeDialog";
import EditTaskDialog from "./components/EditTaskDialog";
import SettingsDialog from "./components/SettingsDialog";

import { startOfISOWeek } from "./lib/week";
import type { Task } from "./types";

// персистентность «на пользователя»
import { getTgId } from "./lib/user";
import {
  loadTasks,
  saveTasks,
  clearAll,
} from "./lib/storage";


function Home() {
  // ===== STATE =====
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addTimeFor, setAddTimeFor] = useState<string | null>(null);
  const [editFor, setEditFor] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openSettings, setOpenSettings] = useState(false);

  const backendName = useMemo(() => {
    try {
      const k = "__probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return "localStorage";
    } catch {
      return "memory";
    }
  }, []);

  // стабильный ключ пользователя на время сессии
  const [userKey, setUserKey] = useState<string>(() => getTgId());

  // флажок «данные загружены», чтобы не затереть LS пустым массивом на старте
  const didLoadRef = useRef(false);

  // если сначала был "guest", а позже пришёл реальный tg id — однократно мигрируем
  useEffect(() => {
    let stopped = false;

    const tryUpdate = () => {
      if (stopped) return;
      const runtimeId = getTgId();
      if (runtimeId && runtimeId !== userKey) {
        // если в guest что-то есть, а у нового id пусто — переносим
        const guest = loadTasks(userKey);
        const real = loadTasks(runtimeId);
        if (guest.length && real.length === 0) {
          saveTasks(runtimeId, guest);
          if (userKey === "guest") clearAll("guest");
        }
        setUserKey(runtimeId);
        stopped = true;
      }
    };

    // моментальная проверка + короткий поллинг (до 5 сек)
    tryUpdate();
    const start = Date.now();
    const id = setInterval(() => {
      if (Date.now() - start > 5000) {
        clearInterval(id);
        return;
      }
      tryUpdate();
    }, 500);

    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [userKey]);

  // загрузка задач при старте / смене userKey
  useEffect(() => {
    const initial = loadTasks(userKey);
    setTasks(Array.isArray(initial) ? initial : []);
    didLoadRef.current = true;

    // сброс вспомогательных состояний
    setAddTimeFor(null);
    setEditFor(null);
    setExpandedId(null);
  }, [userKey]);


  // ISO-понедельник текущей недели (для привязки задач)
  const weekStartISO = useMemo(() => {
    const d = startOfISOWeek(new Date());
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  // ===== CREATE из bottom-sheet хедера =====
  const handleCreateInHeader = useCallback(
    ({ title, hours }: { title: string; hours: number }) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const task: Task = {
        id,
        title: title.trim(),
        targetMinutes: Math.max(1, Math.round(Number(hours) * 60)),
        weekStart: weekStartISO,
        totalLogged: 0,
      };
      setTasks((prev) => {
        const next = [task, ...prev];
        saveTasks(userKey, next);
        return next;
      });
      // новая карточка остаётся закрытой
      setExpandedId(null);
    },
    [weekStartISO, userKey]
  );

  // ===== UPDATE helpers =====
  const addTime = useCallback(
    (id: string, minutes: number) => {
      setTasks((prev) => {
        const next = prev.map((t) =>
          t.id === id
            ? { ...t, totalLogged: Math.max(0, t.totalLogged + minutes) }
            : t
        );
        saveTasks(userKey, next);
        return next;
      });
    },
    [userKey]
  );

  const editTask = useCallback(
    (id: string, data: { title: string; targetMinutes: number }) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...data } : t));
        saveTasks(userKey, next);
        return next;
      });
    },
    [userKey]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== id);
        saveTasks(userKey, next);
        return next;
      });
      if (addTimeFor === id) setAddTimeFor(null);
      if (editFor === id) setEditFor(null);
      if (expandedId === id) setExpandedId(null);
    },
    [addTimeFor, editFor, expandedId, userKey]
  );

  const currentEdit = editFor
    ? tasks.find((t) => t.id === editFor) ?? null
    : null;

  // ===== RENDER =====
  return (
    <Page>
      <HeroHeader
        tasksCount={tasks.length}
        onCreateInHeader={handleCreateInHeader}
        onOpenSettings={() => setOpenSettings(true)}
      />

      {import.meta.env.DEV && (
        <Typography
          variant="caption"
          sx={{ opacity: 0.6, px: 2, display: "block" }}
        >
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
              onToggle={(id) =>
                setExpandedId((prev) => (prev === id ? null : id))
              }
              onAddTime={(id) => setAddTimeFor(id)}
              onEdit={(id) => setEditFor(id)}
            />
          ))}
        </Stack>
      </Box>

      {/* Bottom sheets */}
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
            ? {
                title: currentEdit.title,
                targetMinutes: currentEdit.targetMinutes,
              }
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
        onDeleteAll={() => {
          setTasks([]);
          setAddTimeFor(null);
          setEditFor(null);
          setExpandedId(null);
          clearAll(userKey);
          setOpenSettings(false);
          // (window as any)?.Telegram?.WebApp?.close?.(); // если нужно закрывать мини-апп
        }}
      />
    </Page>
  );
}

export default function App() {
  return <Home />;
}