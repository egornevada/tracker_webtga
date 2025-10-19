import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";

export default function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <LinearProgress
      variant="determinate"
      value={v}
      sx={{
        height: 10,
        borderRadius: 999,
        [`&.${linearProgressClasses.colorPrimary}`]: {
          backgroundColor: "rgba(255,255,255,0.08)",
        },
        [`& .${linearProgressClasses.bar}`]: {
          borderRadius: 999,
          backgroundColor: "primary.main",
        },
      }}
    />
  );
}