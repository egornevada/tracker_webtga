import { Dialog, Box, Stack, Typography, Button, IconButton } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleteAll: () => void;
};

export default function SettingsDialog({ open, onClose, onDeleteAll }: Props) {
  const tg = (window as any)?.Telegram?.WebApp as any | undefined;
  type TgUser = { id?: number; username?: string; first_name?: string; last_name?: string };
  const user: TgUser | undefined = tg?.initDataUnsafe?.user as TgUser | undefined;
  const telegramName = user?.username
    ? `@${user.username}`
    : [user?.first_name, user?.last_name].filter(Boolean).join(" ") || (user?.id ? `ID: ${user.id}` : null);
  const accountText = telegramName ?? "Гость (браузер)";

  const handleDelete = () => {
    onDeleteAll();
    // Попробуем закрыть мини-приложение
    try {
      tg?.HapticFeedback?.impactOccurred?.("medium");
      tg?.close?.();
    } catch {
      /* no-op */
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: "background.default",
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0,0,0,0.35)",
        },
      }}
    >
      <Box sx={{ position: "relative", p: 3 }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 8, top: 8, color: "text.secondary" }}
          aria-label="Закрыть"
        >
          <CloseRoundedIcon />
        </IconButton>

        <Stack spacing={2}>
          <Typography variant="h4">Настройки</Typography>

          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>Аккаунт Telegram</Typography>
            <Typography variant="h6">{accountText}</Typography>
          </Box>

          <Button
            variant="contained"
            disableElevation
            onClick={handleDelete}
            fullWidth
            sx={{
              height: 56,
              borderRadius: "16px",
              px: 2,
              justifyContent: "flex-start",
              boxShadow: "none",
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
              "&:hover": { bgcolor: "secondary.main", filter: "brightness(0.95)" },
            }}
            startIcon={<DeleteOutlineRoundedIcon />}
          >
            Удалить аккаунт
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}