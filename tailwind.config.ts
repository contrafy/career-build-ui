import { type Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        success: "oklch(var(--success) / <alpha-value>)",
        "success-foreground": "oklch(var(--success-foreground) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};

export default config;
