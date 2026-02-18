import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        scada: {
          bg: "#030a14",
          panel: "#060d1a",
          card: "#09132199",
          border: "#1a2d4a",
          "border-glow": "#00d4ff33",
          cyan: "#00d4ff",
          green: "#10b981",
          red: "#ff3d57",
          amber: "#f59e0b",
          "text-1": "#e2e8f0",
          "text-2": "#94a3b8",
          "text-3": "#475569",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        scanline: "scanline 4s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 212, 255, 0.2)",
        "glow-red": "0 0 30px rgba(255, 61, 87, 0.25)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.2)",
        "inner-glow": "inset 0 1px 0 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
