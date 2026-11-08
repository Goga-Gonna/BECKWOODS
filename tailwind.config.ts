import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./config/**/*.ts"],
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1366px",
      "2xl": "1920px",
    },
    extend: {
      colors: {
        bw: {
          black: "#050506",
          ink: "#0B0B0D",
          graphite: "#141416",
          steel: "#1F2023",
          chrome: "#C9CDD2",
          silver: "#E6E8EB",
          mute: "#7A7F87",
          ice: "#8FB8FF",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        bw: "cubic-bezier(.22,1,.36,1)",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: { shimmer: "shimmer 3s linear infinite" },
    },
  },
  plugins: [],
};

export default config;
