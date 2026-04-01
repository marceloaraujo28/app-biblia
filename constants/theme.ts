import { Platform } from "react-native";

const tintColorLight = "#B7A48B";
const tintColorDark = "#E8DCCB";

export const Colors = {
  light: {
    text: "#4E4034",
    textMuted: "#8E7D6B",
    background: "#F6F1EB",
    surface: "#FFFDFC",
    surfaceSoft: "#F1E8DE",
    card: "#FBF7F2",
    border: "#E6D9CC",
    borderStrong: "#D9C7B4",
    primary: "#B7A48B",
    primarySoft: "#EADFD2",
    accent: "#CDB8A2",
    tint: tintColorLight,
    icon: "#8A7763",
    tabIconDefault: "#A89480",
    tabIconSelected: tintColorLight,
    shadow: "rgba(122, 97, 72, 0.10)",
    highlightYellow: "#F3E7AE",
    highlightGreen: "#DDECCF",
    highlightBlue: "#D9E7F6",
    highlightPink: "#F3DDE4",
    danger: "#C97C6D",
  },
  dark: {
    text: "#F2E7DA",
    textMuted: "#C7B6A5",
    background: "#171412",
    surface: "#211C19",
    surfaceSoft: "#2B2521",
    card: "#241F1B",
    border: "#3A312B",
    borderStrong: "#4A3F37",
    primary: "#D5C0A9",
    primarySoft: "#3A3029",
    accent: "#BFA489",
    tint: tintColorDark,
    icon: "#D8C4AE",
    tabIconDefault: "#A99682",
    tabIconSelected: tintColorDark,
    shadow: "rgba(0, 0, 0, 0.35)",
    highlightYellow: "#6B5A1A",
    highlightGreen: "#36563A",
    highlightBlue: "#324B68",
    highlightPink: "#6A4450",
    danger: "#D79280",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Segoe UI', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  },
});

export const AppTheme = {
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  iconSize: {
    sm: 18,
    md: 22,
    lg: 26,
  },
};
