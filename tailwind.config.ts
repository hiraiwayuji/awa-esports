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
          950: "#040611",
          900: "#070B1F",
          800: "#0B1230",
          700: "#101B47",
          600: "#1B2A6B",
          500: "#283DA1",
        },
        // ネオン系アクセント — シアン × エメラルドグロー
        "neon-cyan": "#00F0FF",
        "neon-blue": "#3DB8FF",
        "awa-glow": "#2DFFB7",
        "awa-glow-deep": "#0FA37A",
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
          "radial-gradient(circle at center, rgba(45,255,183,0.25), transparent 60%)",
        "awa-gradient":
          "linear-gradient(135deg, #040611 0%, #070B1F 50%, #0B1230 100%)",
        "cyan-glow":
          "linear-gradient(90deg, #00F0FF 0%, #2DFFB7 100%)",
      },
      boxShadow: {
        neon: "0 0 16px rgba(0,240,255,0.55), 0 0 40px rgba(0,240,255,0.25)",
        glow: "0 0 16px rgba(45,255,183,0.55), 0 0 40px rgba(45,255,183,0.25)",
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
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "scan-line": "scan-line 4s linear infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 6s linear infinite",
        "marquee": "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 36s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
