import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "var(--canvas)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        border: "var(--border)",
        overlay: "var(--overlay)",
        accent: {
          baseline: "rgb(var(--accent-baseline-rgb) / <alpha-value>)",
          DEFAULT: "rgb(var(--accent-default-rgb) / <alpha-value>)",
          subdued: "var(--accent-subdued)",
        },
        neutral: {
          DEFAULT: "rgb(var(--neutral-default-rgb) / <alpha-value>)",
          subdued: "var(--neutral-subdued)",
        },
        approved: "var(--row-approved)",
        dirty: "var(--row-dirty)",
      },
    },
  },
  plugins: [],
} satisfies Config;
