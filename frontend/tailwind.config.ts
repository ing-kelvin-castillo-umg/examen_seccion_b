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
        ivory: {
          25: '#FFFDF8',
          50: '#FAF6EE',
          100: '#F6F0E6',
          200: '#F2EBDD',
          300: '#EFE7DA',
          400: '#E4D9C8',
        },
        steel: {
          50: '#E4ECF5',
          100: '#C8D6E6',
          500: '#415F82',
          600: '#344E6D',
          700: '#263D59',
        },
        navy: {
          700: '#223650',
          800: '#172538',
          900: '#0D1B2A',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8fe9',
          600: '#0271c7',
          700: '#035aa1',
          800: '#074c85',
          900: '#0c406e',
        }
      }
    },
  },
  plugins: [],
};
export default config;
