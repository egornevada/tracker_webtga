// src/components/TaskItem.tsx
import { useState, useMemo } from "react";
import { Box, Typography, Stack, Button, Collapse } from "@mui/material";
import TimerRounded from "@mui/icons-material/TimerRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import SurfaceCard from "./SurfaceCard";
import ProgressBar from "./ProgressBar";
import type { Task } from "../types";

/**
 * Компонент карточки задачи.
 *  - Клик по верхней части карточки разворачивает/сворачивает блок действий.
 *  - В свернутом состоянии показываем только заголовок, прогресс и подпись.
 *  - В развернутом — две кнопки: "+ время" (круглая) и "редактировать" (пилл).
 *  - Может работать в контролируемом режиме через props `expanded`/`onToggle`.
 */

export type TaskItemProps = {
  task: Task;
  onAddTime?: (id: string) => void;
  onEdit?: (id: string) => void;
  /** Если задано — контролируемый режим */
  expanded?: boolean;
  /** Тогглер в контролируемом режиме */
  onToggle?: (id: string) => void;
};

export default function TaskItem({ task, onAddTime, onEdit, expanded, onToggle }: TaskItemProps) {
  const pct = task.targetMinutes > 0
    ? Math.min(100, Math.round((task.totalLogged / task.targetMinutes) * 100))
    : 0;

  const targetH = useMemo(() => Math.round(task.targetMinutes / 60), [task.targetMinutes]);
  const loggedH = useMemo(() => Math.floor(task.totalLogged / 60), [task.totalLogged]);

  // Неконтролируемый режим (если не переданы expanded/onToggle)
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = expanded ?? localExpanded;
  const toggle = () => {
    if (onToggle) onToggle(task.id);
    else setLocalExpanded(v => !v);
  };

  return (
    <SurfaceCard>
      {/* HEADER – кликабельная область */}
      <Box onClick={toggle} sx={{ cursor: "pointer" }}>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
          {task.title}
        </Typography>

        <ProgressBar value={pct} />

        <Typography variant="body2" sx={{ mt: 1, opacity: 0.5 }}>
          Вы затрекали {loggedH} из {targetH} часов
        </Typography>
      </Box>

      {/* ACTIONS */}
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {/* Кнопка "+ время" — как в хедере: 56px, радиус 16, только иконка */}
          <Button
            variant="contained"
            disableElevation
            aria-label="Добавить время"
            onClick={(e) => {
              e.stopPropagation();
              onAddTime?.(task.id);
            }}
            sx={{
              height: 40,
              borderRadius: "16px",
              px: 1,
              minWidth: 0,
              flex: 1,
              boxShadow: "none",
              bgcolor: (t) => t.palette.secondary.main,
              color: (t) => t.palette.secondary.contrastText,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { bgcolor: (t) => t.palette.secondary.main, filter: "brightness(0.95)" },
            }}
          >
            <TimerRounded />
          </Button>

          {/* Кнопка "редактировать" — те же габариты, только иконка */}
          <Button
            variant="contained"
            disableElevation
            aria-label="Редактировать задачу"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task.id);
            }}
            sx={{
              height: 40,
              borderRadius: "16px",
              px: 1,
              minWidth: 0,
              flex: 1,
              boxShadow: "none",
              bgcolor: (t) => t.palette.secondary.main,
              color: (t) => t.palette.secondary.contrastText,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { bgcolor: (t) => t.palette.secondary.main, filter: "brightness(0.95)" },
            }}
          >
            <EditRounded />
          </Button>
        </Stack>
      </Collapse>
    </SurfaceCard>
  );
}