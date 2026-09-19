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
        // Paleta distintiva de marca: teal/esmeralda profundo (primaria)
        brand: {
          50: '#effcf6',
          100: '#d7f7e8',
          200: '#b0efd1',
          300: '#7ee2b8',
          400: '#46cf9b',
          500: '#1fae7f',
          600: '#128a67',
          700: '#0f6d54',
          800: '#0f5745',
          900: '#0e483b',
          950: '#072921',
        },
        // Dorado/ámbar cálido: acento secundario (rol Admin, detalles premium)
        accent: {
          50: '#fff8eb',
          100: '#ffecc7',
          200: '#ffd98a',
          300: '#ffc04d',
          400: '#ffab24',
          500: '#f78f08',
          600: '#d66f04',
          700: '#ad5308',
          800: '#8c410d',
          900: '#74370f',
          950: '#431c05',
        },
      }
    },
  },
  plugins: [],
};
export default config;
