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
          50: "#EEF6FF",
          100: "#D9EAFF",
          200: "#BCD9FF",
          300: "#8EC0FF",
          400: "#579DFF",
          500: "#2F78ED",
          600: "#1F5FD1",
          700: "#1D4DA8",
          800: "#1D4185",
          900: "#1B376D",
          950: "#0B1733",
        },
        canvas: "#F3F6FB",
        ink: "#10203A",
        muted: "#5F6F86",
        line: "#DCE5F0",
      },
      boxShadow: {
        panel: "0 16px 40px -24px rgba(11, 23, 51, 0.28)",
        soft: "0 8px 24px -18px rgba(11, 23, 51, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
