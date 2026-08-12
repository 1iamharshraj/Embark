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
        orange: "#2E6BFF",
        orangeDeep: "#1D4ED8",
        orangeSoft: "#E5EDFF",
        cream: "#F4F7FC",
        charcoal: "#161616",
        inkSoft: "#6B7280",
        navy: "#0B1F3A",
        navyDeep: "#08172B",
        green: "#0B1F3A",
        white: "#FFFFFF",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.15s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
