import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1720",
        mist: "#f4efe7",
        ember: "#d55d3d",
        moss: "#275b4d",
        gold: "#d2a94a",
        slate: "#3b4958"
      },
      boxShadow: {
        halo: "0 24px 80px rgba(15, 23, 32, 0.18)"
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "sans-serif"],
        body: ["Manrope", "ui-sans-serif", "sans-serif"],
        serif: ["Instrument Serif", "ui-serif", "serif"]
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(15, 23, 32, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 32, 0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
} satisfies Config;
