import type { Config } from "tailwindcss";

// Paleta "Bosque & Ámbar": verde azulado profundo (brand), ámbar (accent) y neutros
// entintados de verde (ink). Textos sobre brand-600+ / accent-700 cumplen WCAG AA (>= 4.5:1 con blanco).
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcf9",
          100: "#d0f7ef",
          200: "#a4ede0",
          300: "#6cddcc",
          400: "#35c2b2",
          500: "#14a394",
          600: "#0f7a70",
          700: "#0d635c",
          800: "#0f4e4a",
          900: "#103f3d",
          950: "#052625",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        ink: {
          50: "#f3f7f7",
          100: "#e3ecec",
          200: "#c7d8d9",
          300: "#9db7ba",
          400: "#6d9096",
          500: "#4d7178",
          600: "#3a5a61",
          700: "#2a464d",
          800: "#1a343b",
          900: "#102329",
          950: "#0a171b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
