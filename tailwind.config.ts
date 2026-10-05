import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          900: "#0a0a0a",
          800: "#171717",
          700: "#262626",
          600: "#404040",
          500: "#525252",
          400: "#737373",
          300: "#a3a3a3",
          200: "#e5e5e5",
          100: "#f5f5f5",
        },
        // Vert néon : toujours utilisé en fond avec du texte noir (contraste 15:1),
        // ou en texte sur fond noir. Jamais en texte sur fond blanc.
        accent: {
          DEFAULT: "#c6ff00",
          hover: "#b4ec00",
          dark: "#4d6b00",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
      },
      container: {
        center: true,
        padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
        screens: { "2xl": "1400px" },
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [forms],
};

export default config;
