import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        edge: {
          bg: "#09090b",          // zinc-950
          card: "rgba(24,24,27,0.7)", // zinc-900/70
          border: "#27272a",      // zinc-800
          text: "#f4f4f5",        // zinc-100
          muted: "#a1a1aa",       // zinc-400
          dim: "#71717a",         // zinc-500
          accent: "#22d3ee",      // cyan-400
          "accent-hover": "#06b6d4", // cyan-500
          positive: "#34d399",    // emerald-400
          negative: "#f87171",    // red-400
          warning: "#fbbf24",     // amber-400
        },
      },
      fontFamily: {
        display: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
