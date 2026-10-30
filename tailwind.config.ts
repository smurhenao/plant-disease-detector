import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          50: "#f4f7f4",
          100: "#e3ebe3",
          200: "#c8d8c8",
          300: "#9ebc9f",
          400: "#6e9870",
          500: "#4b7b4e",
          600: "#39613c",
          700: "#2e4e31",
          800: "#273f29",
          900: "#1f3321",
          950: "#101b11",
        },
      },
      keyframes: {
        scanline: {
          "0%, 100%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(320px)" },
        },
      },
      animation: {
        scanline: "scanline 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
