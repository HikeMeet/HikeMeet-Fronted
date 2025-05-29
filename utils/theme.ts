// utils/theme.ts
/* ---------- צבעים בסיסיים ---------- */
export const palette = {
  primary: "#0D9488", // Teal-600
  secondary: "#14B8A6", // Teal-500
  error: "#EF4444",
  gray900: "#111827",
  gray700: "#374151",
  gray100: "#F3F4F6",
} as const;

/* ---------- רדיוסים ---------- */
export const radii = {
  sm: 8,
  md: 14,
  lg: 24,
} as const;

/* ---------- צללים ---------- */
export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;

/* ---------- גדלי גופנים ---------- */
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  "2xl": 26,
} as const;

/* ---------- אובייקט Theme כולל ---------- */
export const theme = {
  /* צבעים */
  colors: {
    primary: palette.primary,
    secondary: palette.secondary,
    background: "#F9FAFB",
    surface: "#FFFFFF",
    text: {
      primary: palette.gray900,
      secondary: "#6B7280",
      light: "#9CA3AF",
    },
    border: "#E5E7EB",
    error: palette.error,
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
  },

  /* מרווחים */
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  radii,
  shadows,
  fontSizes,

  /* אנימציות */
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
} as const;
