import { useEffect, useMemo, useState } from "react";
import { Box, Button, IconButton, Stack, TextField } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import { tokens } from "../theme/tokens";

// Types
type Init = { title: string; targetMinutes: number };
type Props = {
  open: boolean;
  initial: Init | null;
  onClose: () => void;
  onSave: (data: Init) => void;
  onDelete?: () => void;
};

export default function EditTaskDialog({ open, initial, onClose, onSave, onDelete }: Props) {
  // derive controlled state from initial
  const start = useMemo(() => initial ?? { title: "", targetMinutes: 60 }, [initial]);
  const [title, setTitle] = useState(start.title);
  const [hours, setHours] = useState(Math.max(0, Math.round(start.targetMinutes / 60)));

  // sync when dialog opens / initial changes
  useEffect(() => {
    setTitle(start.title);
    setHours(Math.max(0, Math.round(start.targetMinutes / 60)));
  }, [start.title, start.targetMinutes, open]);

  // lock scroll like in HeroHeader
  useEffect(() => {
    if (!open) return;
    const doc = document.documentElement;
    const body = document.body as HTMLBodyElement;
    const scrollY =
      window.scrollY || window.pageYOffset || doc.scrollTop || body.scrollTop || 0;

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
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const canSave = title.trim() !== "" && hours >= 0;

  const save = () => {
    if (!canSave) return;
    onSave({ title: title.trim(), targetMinutes: Math.max(0, Math.round(hours * 60)) });
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      // no blur, same behaviour as create sheet
      slotProps={{ backdrop: { sx: { touchAction: "none", backdropFilter: "none" } } }}
      PaperProps={{
        sx: {
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
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
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
          value={hours}
          onChange={(e) => setHours(Number(e.target.value || 0))}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {/* Delete icon-only button on the left */}
          <IconButton
            aria-label="Удалить задачу"
            onClick={onDelete}
            disabled={!onDelete}
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              bgcolor: onDelete ? "error.main" : "action.disabledBackground",
              color: onDelete ? "error.contrastText" : "text.disabled",
              "&:hover": onDelete ? { bgcolor: "error.main", filter: "brightness(0.95)" } : undefined,
            }}
          >
            <DeleteRounded fontSize="medium" />
          </IconButton>

          {/* Save button fills the remaining width */}
          <Button
            variant="contained"
            disableElevation
            fullWidth
            onClick={save}
            disabled={!canSave}
            sx={{
              height: 56,
              borderRadius: "16px",
              boxShadow: "none",
              bgcolor: tokens.color.secondary,
              color: tokens.color.onSecondary,
              "&:hover": { bgcolor: tokens.color.secondary, filter: "brightness(0.95)" },
            }}
          >
            Сохранить
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}