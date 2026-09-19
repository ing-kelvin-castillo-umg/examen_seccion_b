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
        brand: {
          50: '#edfffb',
          100: '#c9fff3',
          200: '#96f8e5',
          300: '#5ae9d2',
          400: '#2bd2bb',
          500: '#12b8a3',
          600: '#0a9487',
          700: '#08766f',
          800: '#095e5b',
          900: '#0a4e4d',
        },
        coral: {
          50: '#fff4ed',
          100: '#ffe4d4',
          200: '#ffc5a8',
          300: '#ff9d77',
          400: '#ff7655',
          500: '#f45b42',
          600: '#df3f31',
          700: '#ba3028',
          800: '#982b27',
          900: '#7b2927',
        },
        midnight: {
          50: '#effcfb',
          100: '#d6f5f3',
          200: '#afe9e5',
          300: '#79d5d0',
          400: '#3eb7b4',
          500: '#209997',
          600: '#187a7b',
          700: '#185f62',
          800: '#174b4f',
          900: '#143e43',
          950: '#071c21',
        },
      }
    },
  },
  plugins: [],
};
export default config;
