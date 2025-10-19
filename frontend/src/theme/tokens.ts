export const tokens = {
  // ===== Schemes (скрин 1) =====
  color: {
    // Primary
    primary: "#586420",
    onPrimary: "#FFFFFF",
    primaryContainer: "#DAFE08",
    onPrimaryContainer: "#627300",

    // Secondary
    secondary: "#556500",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#6C7F00",
    onSecondaryContainer: "#040600",

    // Tertiary
    tertiary: "#0F1300",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#222900",
    onTertiaryContainer: "#89925B",

    // Error
    error: "#BA1A1A",
    onError: "#FFFFFF",
    errorContainer: "#FFDAD6",
    onErrorContainer: "#93000A",

    // Background / Surface
    background: "#121408",
    onBackground: "#E3E4CF",
    surface: "#141313",
    onSurface: "#E5E2E1",
    surfaceVariant: "#444748",
    onSurfaceVariant: "#C4C7C7",

    // Outline
    outline: "#8E9192",
    outlineVariant: "#444748",

    // ===== Доп. переменные (скрин 2) =====
    surfaceTint: "#566500",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#313030",
    inverseOnSurface: "#F4F0EF",
    inversePrimary: "#B5D400",

    // Fixed (Material 3)
    primaryFixed: "#CFF100",
    onPrimaryFixed: "#181E00",
    primaryFixedDim: "#B5D400",
    primaryFixedVariant: "#404C00",

    secondaryFixed: "#D6ED6F",
    onSecondaryFixed: "#181E00",
    secondaryFixedDim: "#BBD156",
    secondaryFixedVariant: "#404C00",

    tertiaryFixed: "#DEE8AA",
    onTertiaryFixed: "#181E00",
    tertiaryFixedDim: "#C2CC90",
    tertiaryFixedVariant: "#434B1C",

    // ===== Surface Containers (скрин 3) =====
    surfaceDim: "#141313",
    surfaceBright: "#3A3939",
    surfaceContainerLowest: "#0E0E0E",
    surfaceContainerLow: "#1C1B1B",
    surfaceContainer: "#201F1F",
    surfaceContainerHigh: "#2B2A2A",
    surfaceContainerHighest: "#353434",
  },

  // ===== Typography (Rubik only) =====
  type: {
    family: "'Rubik Variable','Rubik',system-ui,-apple-system,'Segoe UI','Roboto',sans-serif",

    // display
    displayLarge:   { size: 57, line: 64, weight: 400 },
    displayLargeEmphasized: { size: 57, line: 64, weight: 600 },
    displayMedium:  { size: 45, line: 52, weight: 400 },
    displayMediumEmphasized: { size: 45, line: 52, weight: 600 },
    displaySmall:   { size: 36, line: 44, weight: 400 },
    displaySmallEmphasized: { size: 36, line: 44, weight: 600 },

    // headline
    headlineLarge:  { size: 32, line: 40, weight: 400 },
    headlineLargeEmphasized: { size: 32, line: 40, weight: 600 },
    headlineMedium: { size: 28, line: 36, weight: 400 },
    headlineMediumEmphasized: { size: 28, line: 36, weight: 600 },
    headlineSmall:  { size: 24, line: 32, weight: 400 },
    headlineSmallEmphasized: { size: 24, line: 32, weight: 600 },

    // title
    titleLarge:     { size: 22, line: 28, weight: 400 },
    titleLargeEmphasized: { size: 22, line: 28, weight: 600 },
    titleMedium:    { size: 16, line: 24, weight: 400 },
    titleMediumEmphasized: { size: 16, line: 24, weight: 600 },
    titleSmall:     { size: 14, line: 20, weight: 400 },
    titleSmallEmphasized: { size: 14, line: 20, weight: 600 },

    // label
    labelLarge:     { size: 14, line: 20, weight: 400 },
    labelLargeEmphasized: { size: 14, line: 20, weight: 600 },
    labelMedium:    { size: 12, line: 16, weight: 400 },
    labelMediumEmphasized: { size: 12, line: 16, weight: 600 },
    labelSmall:     { size: 11, line: 16, weight: 400 },
    labelSmallEmphasized: { size: 11, line: 16, weight: 600 },

    // body
    bodyLarge:      { size: 16, line: 24, weight: 400 },
    bodyLargeEmphasized: { size: 16, line: 24, weight: 600 },
    bodyMedium:     { size: 14, line: 20, weight: 400 },
    bodyMediumEmphasized: { size: 14, line: 20, weight: 600 },
    bodySmall:      { size: 12, line: 16, weight: 400 },
    bodySmallEmphasized: { size: 12, line: 16, weight: 600 },
  },
} as const;