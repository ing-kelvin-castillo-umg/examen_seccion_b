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
        /**
         * Paleta Fase 4 — violeta/índigo profundo (primary) + ámbar/dorado
         * (accent), con neutros de matiz frío coherente con el primario (no
         * slate puro) y una familia semántica completa (success/warning/
         * error/info). Cada escala tiene 11 pasos (50→950), generada
         * sistemáticamente en HSL con hue fijo por familia y verificada con
         * la fórmula de contraste WCAG (ver informe de la Fase 4 para el
         * detalle de cada combinación texto/fondo).
         */

        // Primario: violeta-índigo (H=256°). Color de marca, CTAs
        // principales, navegación activa, enlaces.
        primary: {
          50: "#f5f3fc",
          100: "#e8e2f8",
          200: "#cdbff3",
          300: "#a68cee",
          400: "#7a51ec",
          500: "#4e14eb",
          600: "#4315c1",
          700: "#391797",
          800: "#301772",
          900: "#251551",
          950: "#170f2e",
        },

        // Acento: ámbar/dorado (H=40°). CTAs secundarios, badges
        // destacados, detalles decorativos. Los botones de acento usan
        // texto oscuro (neutral-950), no blanco: ver informe (blanco sobre
        // dorado no pasa WCAG AA).
        accent: {
          50: "#fdf9f2",
          100: "#fcf2df",
          200: "#f9e4b8",
          300: "#f7d082",
          400: "#f5bb47",
          500: "#f5a70a",
          600: "#c98b0d",
          700: "#8b610e",
          800: "#785612",
          900: "#553e11",
          950: "#30240d",
        },

        // Neutros: gris con matiz violeta frío (mismo H=256° que primary,
        // saturación muy baja). Reemplaza a slate en todos los fondos,
        // bordes y textos neutros de la app.
        neutral: {
          50: "#f7f6f9",
          100: "#eceaf0",
          200: "#d6d3df",
          300: "#b8b3c6",
          400: "#9992aa",
          500: "#7a738c",
          600: "#655e78",
          700: "#514b63",
          800: "#403a50",
          900: "#2e293d",
          950: "#1b1726",
        },

        // Semántico: éxito (H=152°, verde). Stock disponible, rol usuario,
        // confirmaciones.
        success: {
          50: "#f3fcf8",
          100: "#e2f8ee",
          200: "#c1f0da",
          300: "#92e8c0",
          400: "#5ce0a2",
          500: "#26d985",
          600: "#22b470",
          700: "#1f8e5a",
          800: "#1d6d48",
          900: "#184e35",
          950: "#112d20",
        },

        // Semántico: advertencia (H=32°, ámbar-naranja). Avisos de
        // inactividad, precauciones. Distinto de `accent` (H=40°) a
        // propósito: mismo espíritu dorado, pero más anaranjado para
        // leerse como "cuidado", no como decoración de marca.
        warning: {
          50: "#fdf8f2",
          100: "#fbeedf",
          200: "#f8dbb9",
          300: "#f6c184",
          400: "#f3a449",
          500: "#f2870d",
          600: "#c7710f",
          700: "#9c5b11",
          800: "#764813",
          900: "#543512",
          950: "#2f200e",
        },

        // Semántico: error (H=355°, rojo con leve giro a magenta para
        // armonizar con el violeta primario). Errores, eliminar, agotado.
        error: {
          50: "#fdf2f3",
          100: "#fbdfe2",
          200: "#f7babf",
          300: "#f3868f",
          400: "#ef4d5a",
          500: "#ed1224",
          600: "#c31322",
          700: "#991520",
          800: "#74161e",
          900: "#521419",
          950: "#2f0f11",
        },

        // Semántico: información (H=205°, azul-cian). Deliberadamente
        // distinto del primario violeta, para no confundir "marca" con
        // "aviso informativo".
        info: {
          50: "#f3f8fc",
          100: "#e1eff9",
          200: "#bdddf4",
          300: "#8ac5ef",
          400: "#51abec",
          500: "#1791e8",
          600: "#1879bf",
          700: "#186195",
          800: "#194c71",
          900: "#163850",
          950: "#10212d",
        },

        // Alias semánticos planos, para los usos más comunes de superficie.
        surface: "#ffffff",
        muted: "#7a738c", // = neutral-500
      },
    },
  },
  plugins: [],
};
export default config;
