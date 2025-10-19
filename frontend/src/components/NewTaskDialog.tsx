import { useState } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; targetHours: number }) => void;
};

export default function NewTaskDialog({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState<number>(1);

  const canSave = title.trim().length > 0 && hours > 0;

  const handleSave = () => {
    if (!canSave) return;
    onCreate({ title: title.trim(), targetHours: hours });
    setTitle("");
    setHours(1);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Новая задача</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            label="Название задачи"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            fullWidth
          />
          <TextField
            label="Планируемые часы"
            type="number"
            inputProps={{ min: 0.25, step: 0.5 }}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          Добавить задачу
        </Button>
      </DialogActions>
    </Dialog>
  );
}