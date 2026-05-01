import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 徳島藍を核にした深い夜空
        "awa-indigo": {
          950: "#070B1F",
          900: "#0B1230",
          800: "#101B47",
          700: "#1B2A6B",
          600: "#283DA1",
          500: "#3F5BD9",
        },
        // ネオン系アクセント
        "neon-cyan": "#00F0FF",
        "neon-blue": "#3DB8FF",
        "awa-magenta": "#FF2D95",
        "awa-violet": "#9B5CFF",
        // PARTNERS用の温かみ（提灯色）
        "awa-warmth": "#F0B95C",
        "awa-paper": "#F5EFE0",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        accent: ["Anton", "sans-serif"],
        body: ["'Noto Sans JP'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-cyber":
          "linear-gradient(rgba(0,240,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.08) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at center, rgba(0,240,255,0.25), transparent 60%)",
        "awa-gradient":
          "linear-gradient(135deg, #070B1F 0%, #101B47 50%, #1B2A6B 100%)",
        "magenta-cyan":
          "linear-gradient(90deg, #FF2D95 0%, #9B5CFF 50%, #00F0FF 100%)",
      },
      boxShadow: {
        neon: "0 0 16px rgba(0,240,255,0.55), 0 0 40px rgba(0,240,255,0.25)",
        magenta: "0 0 16px rgba(255,45,149,0.55), 0 0 40px rgba(255,45,149,0.25)",
        warmth: "0 0 24px rgba(240,185,92,0.35)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "scan-line": "scan-line 4s linear infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 6s linear infinite",
        "marquee": "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
