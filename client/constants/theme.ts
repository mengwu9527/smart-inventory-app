export const Colors = {
  light: {
    textPrimary: "#1C1917",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    primary: "#3B82F6", // Blue-500 - 商业蓝，代表专业与信任
    accent: "#8B5CF6", // Violet-500 - 辅助色，代表创造力
    success: "#10B981", // Emerald-500
    error: "#EF4444",
    warning: "#F59E0B", // Amber-500
    backgroundRoot: "#F8FAFC", // Slate-50
    backgroundDefault: "#FFFFFF",
    backgroundTertiary: "#F1F5F9", // Slate-100
    buttonPrimaryText: "#FFFFFF",
    tabIconSelected: "#3B82F6",
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
    cardShadow: "#CBD5E1", // Slate-300
  },
  dark: {
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#64748B",
    primary: "#60A5FA", // Blue-400
    accent: "#A78BFA", // Violet-400
    success: "#34D399",
    error: "#F87171",
    warning: "#FBBF24",
    backgroundRoot: "#0F172A", // Slate-900
    backgroundDefault: "#1E293B", // Slate-800
    backgroundTertiary: "#334155", // Slate-700
    buttonPrimaryText: "#0F172A",
    tabIconSelected: "#60A5FA",
    border: "#334155",
    borderLight: "#1E293B",
    cardShadow: "#000000",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 112,
    lineHeight: 112,
    fontWeight: "200" as const,
    letterSpacing: -4,
  },
  displayLarge: {
    fontSize: 112,
    lineHeight: 112,
    fontWeight: "200" as const,
    letterSpacing: -2,
  },
  displayMedium: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "200" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "300" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  smallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  labelTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  stat: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "300" as const,
  },
  tiny: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "400" as const,
  },
  navLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500" as const,
  },
};

export type Theme = typeof Colors.light;
