import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: { 950: "#080B14", 900: "#0B1020", 800: "#111A2E" },
        mist: { 200: "#E8EDF7", 400: "#AAB4C8", 500: "#8A96AC" },
        cyan: { 400: "#3FD9E8", 500: "#22C3D6" },
        ember: { 400: "#FB923C", 500: "#F2793D" },
        leaf: { 400: "#34D399" },
        rose: { 400: "#F87171" },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
