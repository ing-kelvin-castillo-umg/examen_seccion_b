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
        navy: {
          50: '#eef6f8', 100: '#d9e9ed', 200: '#b8d5dc', 300: '#8bb9c4',
          400: '#5897a6', 500: '#397887', 600: '#2d606e', 700: '#274e5a',
          800: '#0b2436', 900: '#071a2b', 950: '#04111d',
        },
        petrol: {
          50: '#edfcf9', 100: '#d3f8f1', 200: '#abeee4', 300: '#75ddd1',
          400: '#3cc5b9', 500: '#20aa9f', 600: '#158980', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a', 950: '#042f2e',
        },
        aqua: {
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#22d3c5', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
          800: '#155e75', 900: '#164e63',
        },
        mist: '#f2f8f7',
      }
    },
  },
  plugins: [],
};
export default config;
