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
        // Paleta distintiva del sistema (Fase 4): teal como color primario de marca,
        // violeta como acento secundario. Reemplaza el azul/índigo genérico anterior.
        // Los colores semánticos (emerald=éxito, rose=peligro, amber=advertencia) no se tocan.
        brand: {
          50: '#effefa',
          100: '#c7fdf0',
          200: '#90fae0',
          300: '#54f0cd',
          400: '#22dab5',
          500: '#0abd9d',
          600: '#02967f',
          700: '#057868',
          800: '#0a5f54',
          900: '#0c4e46',
          950: '#042f2a',
        },
        accent: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      }
    },
  },
  plugins: [],
};
export default config;
