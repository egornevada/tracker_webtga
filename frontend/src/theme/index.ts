import { createTheme } from "@mui/material/styles";
import { tokens } from "./tokens";

const px = (n: number) => `${n}px`;
const paperBg =
  tokens.color.surfaceContainer ??
  tokens.color.surfaceContainerLow ??
  tokens.color.surface;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary:   { main: tokens.color.primary,   contrastText: tokens.color.onPrimary },
    secondary: { main: tokens.color.secondary, contrastText: tokens.color.onSecondary },
    error:     { main: tokens.color.error,     contrastText: tokens.color.onError },
    background:{ default: tokens.color.background, paper: paperBg },
    text:      { primary: tokens.color.onSurface, secondary: tokens.color.onSurfaceVariant },
    divider:   tokens.color.outline,
  },
  shape: { borderRadius: 12 }, // радиус из макета
  typography: {
    fontFamily: tokens.type.family,
    h5:     { fontSize: px(tokens.type.titleLarge.size),  lineHeight: px(tokens.type.titleLarge.line),  fontWeight: tokens.type.titleLarge.weight },
    body1:  { fontSize: px(tokens.type.bodyLarge.size),   lineHeight: px(tokens.type.bodyLarge.line),   fontWeight: tokens.type.bodyLarge.weight },
    body2:  { fontSize: px(tokens.type.bodyMedium.size),  lineHeight: px(tokens.type.bodyMedium.line),  fontWeight: tokens.type.bodyMedium.weight },
    button: { fontSize: px(tokens.type.labelLarge.size),  lineHeight: px(tokens.type.labelLarge.line),  fontWeight: tokens.type.labelLarge.weight, textTransform: "none" },
  },
  components: {
    MuiPaper:  { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard:   { styleOverrides: { root: { borderRadius: 12, backgroundImage: "none" } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default theme;