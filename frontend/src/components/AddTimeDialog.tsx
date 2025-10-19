import { useEffect, useState } from "react";
import { Box, Button, IconButton, Stack, TextField } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { tokens } from "../theme/tokens";

const px = (n: number) => `${n}px`;
const t = tokens.type;

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (minutes: number) => void; // в App ожидаются минуты
};

export default function AddTimeDialog({ open, onClose, onAdd }: Props) {
  const [hours, setHours] = useState<number>(1);

  // блокируем скролл страницы как в HeroHeader
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

  const quick = [1, 2, 3, 4];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{ backdrop: { sx: { touchAction: "none", backdropFilter: "none" } } }} // без блюра
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
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, pb: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <TextField
          fullWidth
          variant="filled"
          type="number"
          label="Добавить (часы)"
          inputProps={{ min: 0, step: 0.5 }}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value || 0))}
        />

        {/* быстрый выбор */}
        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
          {quick.map((h) => {
            const selected = hours === h;
            return (
              <Button
                key={h}
                onClick={() => setHours(h)}
                disableElevation
                sx={{
                  minWidth: 64,
                  px: 2,
                  height: 40,
                  borderRadius: "12px",
                  border: `1px solid ${selected ? "transparent" : tokens.color.outlineVariant}`,
                  bgcolor: selected ? tokens.color.secondary : tokens.color.surfaceContainer,
                  color: selected ? tokens.color.onSecondary : tokens.color.onSurfaceVariant,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: selected ? tokens.color.secondary : tokens.color.surfaceContainer,
                    filter: selected ? "brightness(0.95)" : "none",
                  },
                }}
              >
                {h}ч
              </Button>
            );
          })}
        </Stack>

        {/* нижний ряд как в HeroHeader: слева маленькая, справа primary */}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <IconButton
            onClick={onClose}
            sx={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              bgcolor: tokens.color.surfaceContainer || tokens.color.surface,
              color: tokens.color.onSurfaceVariant,
            }}
          >
            <CloseRoundedIcon />
          </IconButton>

          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              const mins = Math.max(0, Math.round(hours * 60));
              onAdd(mins);
              onClose();
            }}
            sx={{
              height: 64,
              flex: 1,
              borderRadius: "16px",
              bgcolor: tokens.color.secondary,
              color: tokens.color.onSecondary,
              boxShadow: "none",
              fontWeight: t.titleMedium.weight,
              fontSize: px(t.titleMedium.size),
              lineHeight: px(t.titleMedium.line),
            }}
          >
            Сохранить
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}