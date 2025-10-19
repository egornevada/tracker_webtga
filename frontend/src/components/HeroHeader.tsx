import { useRef, useState, useEffect } from "react";
import {
  Box, Button, IconButton, Stack, Typography, TextField
} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { getWeekInfo } from "../lib/week";
import { tokens } from "../theme/tokens";

const px = (n: number) => `${n}px`;

type Props = {
  tasksCount: number;
  onCreate?: () => void; // оставлено для совместимости (не используется здесь)
  onOpenSettings?: () => void;
  onCreateInHeader?: (payload: { title: string; hours: number }) => void; // новый колбэк создания из шита
};

export default function HeroHeader({ tasksCount, onOpenSettings, onCreateInHeader }: Props) {
  const info = getWeekInfo(new Date());

  const now = new Date();
  const dayMonth = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const weekday = now.toLocaleDateString("ru-RU", { weekday: "long" });
  const today = `${dayMonth}, ${weekday}`; // "18 октября, суббота"

  const t = tokens.type;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [plannedHours, setPlannedHours] = useState<number | "">("");

  // Lock the page scroll while the bottom sheet is open (mobile/iOS safe)
  useEffect(() => {
    if (!isCreateOpen) return;

    const doc = document.documentElement;
    const body = document.body as HTMLBodyElement;

    // robust scrollY detection (works if scrolling element is <html> or <body>)
    const scrollY =
      window.scrollY || window.pageYOffset || doc.scrollTop || body.scrollTop || 0;

    // remember previous inline styles to restore exactly
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    } as const;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      // return to the exact scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isCreateOpen]);

  return (
    <Box
      ref={rootRef}
      sx={{
        position: "relative",
        p: 1,
        pt: 'calc(8px + env(safe-area-inset-top))',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        color: tokens.color.onPrimary || "#0D0F0A",
        background: "linear-gradient(235deg, hsl(98, 62%, 55%) 0%, hsl(68, 97%, 64%) 100%)",
        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
      }}
    >
      <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack direction="row" alignItems="start" justifyContent="space-between" sx={{ width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
            <Typography
              component="p"
              sx={{
                fontSize: px(t.labelSmall.size),
                lineHeight: px(t.labelSmall.line),
                fontWeight: 500,
                color: tokens.color.onPrimaryContainer,
              }}
            >
              Неделя {info.isoWeek}, {info.label}
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontSize: px(t.titleMedium.size),
                lineHeight: px(t.titleMedium.line),
                fontWeight: t.titleMedium.weight,
                letterSpacing: "0.15px",
                color: tokens.color.onSecondaryContainer,
              }}
            >
              Сегодня {today}
            </Typography>
          </Box>

          <IconButton
            onClick={() => { onOpenSettings?.(); }}
            sx={{ alignSelf: "flex-start", color: tokens.color.onSecondaryContainer }}
          >
            <SettingsRoundedIcon />
          </IconButton>
        </Stack>

        {/* Группа: подпись + число, как в макете (вместе) */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            component="p"
            sx={{
              fontSize: px(t.labelSmall.size),
              lineHeight: px(t.labelSmall.line),
              fontWeight: 500,
              color: tokens.color.onPrimaryContainer,
            }}
          >
            На эту неделю у вас задач:
          </Typography>

          <Typography
            component="div"
            sx={{
              fontSize: px(t.displayLarge.size),
              lineHeight: px(t.displayLarge.line),
              fontWeight: 600,
              color: tokens.color.onSecondaryContainer,
            }}
          >
            {tasksCount}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        disableElevation
        onClick={() => setIsCreateOpen(true)}
        fullWidth
        sx={{
          mt: 0, // расстояние задаёт нижний padding внутреннего контейнера
          height: "56px",
          borderRadius: "16px",
          px: 1,
          fontWeight: t.titleMedium.weight,
          fontSize: px(t.titleMedium.size),
          lineHeight: px(t.titleMedium.line),
          letterSpacing: "0.15px",
          boxShadow: "none",
          bgcolor: tokens.color.secondary,
          color: tokens.color.onSecondary,
          "&:hover": { bgcolor: tokens.color.secondary, filter: "brightness(0.95)" },
        }}
      >
        Создать новую задачу
      </Button>
      <Drawer
        anchor="bottom"
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        ModalProps={{ keepMounted: true }}
        slotProps={{ backdrop: { sx: { touchAction: "none" } } }}
        PaperProps={{
          sx: {
            // let MUI Drawer control positioning; we only style look & width
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            bgcolor: tokens.color.surfaceContainerHigh || tokens.color.surface,
            backgroundImage: "none",
            width: "100%",
            maxWidth: "100%",
            left: 0,
            right: 0,
            bottom: 0,
            m: 0,
            boxSizing: "border-box",
            pb: "calc(16px + env(safe-area-inset-bottom))",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, pb: 'calc(16px + env(safe-area-inset-bottom))' }}>
          <TextField
            fullWidth
            variant="filled"
            label="Название задачи"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            variant="filled"
            type="number"
            inputProps={{ min: 0, step: 0.5 }}
            label="Планируемое время (часы)"
            value={plannedHours}
            onChange={(e) => {
              const v = e.target.value;
              setPlannedHours(v === "" ? "" : Number(v));
            }}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => setIsCreateOpen(false)}
              sx={{
                width: 64,
                height: 64,
                borderRadius: "16px",
                bgcolor: tokens.color.surfaceContainer || tokens.color.surface,
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
            <Button
              variant="contained"
              disableElevation
              onClick={() => {
                if (title.trim() !== "" && plannedHours !== "") {
                  onCreateInHeader?.({ title: title.trim(), hours: Number(plannedHours) });
                }
                setIsCreateOpen(false);
                setTitle("");
                setPlannedHours("");
              }}
              disabled={title.trim() === "" || plannedHours === ""}
              sx={{
                height: 64,
                flex: 1,
                borderRadius: "16px",
                bgcolor: tokens.color.secondary,
                color: tokens.color.onSecondary,
                boxShadow: "none",
                fontSize: px(t.titleMedium.size),
                lineHeight: px(t.titleMedium.line),
                fontWeight: t.titleMedium.weight,
              }}
            >
              Создать
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}