import { Box } from "@mui/material";
import type { PropsWithChildren } from "react";

export default function Page({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,            // ключевая ширина макета
          mx: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}