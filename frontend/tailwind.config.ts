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
        // Sage Atelier Palette: Salvia Mate Orgánico & Terracota Cálida
        sage: {
          50: '#f4f7f5',
          100: '#e4ece7',
          200: '#cad9cf',
          300: '#a4bfad',
          400: '#769f90',
          500: '#5a8274', // Tono primario clave
          600: '#46675c',
          700: '#39534a',
          800: '#30433d',
          900: '#293833',
          950: '#15201c',
        },
        clay: {
          50: '#fdf6f4',
          100: '#fbebe7',
          200: '#f7d8d0',
          300: '#f0baad',
          400: '#e49380',
          500: '#d4725b', // Acento cálido clave
          600: '#bf5741',
          700: '#a04533',
          800: '#843b2d',
          900: '#6e352b',
          950: '#3d1a14',
        },
        // Superficies de carbón piedra mate para modo oscuro minimalista
        stoneDark: {
          950: '#0e1111', // Fondo base
          900: '#151918', // Tarjetas / contenedores
          850: '#1c2220', // Elementos elevados
          800: '#27312d', // Bordes sutiles
        },
        brand: {
          50: '#f4f7f5',
          100: '#e4ece7',
          200: '#cad9cf',
          300: '#a4bfad',
          400: '#769f90',
          500: '#5a8274',
          600: '#46675c',
          700: '#39534a',
          800: '#30433d',
          900: '#293833',
        }
      }
    },
  },
  plugins: [],
};
export default config;
