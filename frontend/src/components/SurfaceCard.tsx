import { Card, CardContent } from "@mui/material";
import type { PropsWithChildren } from "react";
import { tokens } from "../theme/tokens";

export default function SurfaceCard({ children }: PropsWithChildren) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",                     // из макета
        bgcolor: tokens.color.surface,
        border: `1px solid ${tokens.color.outlineVariant}`,
      }}
    >
      <CardContent sx={{ p: 2 }}>{children}</CardContent>
    </Card>
  );
}