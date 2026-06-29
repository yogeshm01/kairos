import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050608",
        foreground: "#f4f5f7",
        muted: "#8b93a7",
        surface: "#0c0e14",
        "surface-elevated": "#12151e",
        border: "#1e2330",
        accent: "#6ee7ff",
        "accent-dim": "#38bdf8",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(110, 231, 255, 0.25)",
        "glow-sm": "0 0 30px -8px rgba(110, 231, 255, 0.2)",
      },
      animation: {
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
