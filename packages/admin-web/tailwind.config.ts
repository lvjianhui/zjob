import type { Config } from "tailwindcss";

const emote = {
  50: "#f0f9ff",
  100: "#e0f2fe",
  200: "#bae6fd",
  300: "#7dd3fc",
  400: "#38bdf8",
  500: "#0ea5e9",
  600: "#0284c7",
  700: "#0369a1",
  800: "#075985",
  900: "#0c4a6e",
};

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-family-base)", "PingFang SC", "Microsoft YaHei", "sans-serif"],
      },
      colors: {
        // 语义 token（指向 CSS 变量，与 design 一致）
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-on-surface)",
        },
        popover: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-on-surface)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-on-primary, #ffffff)",
          hover: "var(--color-primary-hover)",
          container: "var(--color-primary-container)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-on-secondary-container)",
          container: "var(--color-secondary-container)",
        },
        muted: {
          DEFAULT: "var(--color-surface-variant)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-primary-container)",
          foreground: "var(--color-on-primary-container)",
        },
        destructive: {
          DEFAULT: "var(--color-error)",
          foreground: "var(--color-on-error)",
        },
        error: "var(--color-error)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
        border: "var(--color-border)",
        input: "var(--color-outline)",
        ring: "var(--color-primary)",
        sidebar: "var(--color-sidebar)",
        "surface-container": "var(--color-surface-container)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container-high": "var(--color-surface-container-high)",
        "outline-variant": "var(--color-outline-variant)",
        // Emote 原始色阶
        emote: {
          sky: emote,
          mint: {
            50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
            400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
            800: "#166534", 900: "#14532d",
          },
          lavender: {
            50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe",
            400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce",
            800: "#6b21a8", 900: "#581c87",
          },
          cream: {
            50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
            400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309",
            800: "#92400e", 900: "#78350f",
          },
          charcoal: {
            50: "#f7f7f8", 100: "#efeff1", 200: "#dfdfe2", 300: "#bdbdc2",
            400: "#9898a0", 500: "#72727d", 600: "#55555e", 700: "#414149",
            800: "#2a2a2f", 900: "#18181b",
          },
          rose: {
            50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af",
            400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c",
            800: "#9f1239", 900: "#881337",
          },
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        float: "var(--shadow-float)",
        modal: "var(--shadow-modal)",
      },
    },
  },
  plugins: [],
};

export default config;
