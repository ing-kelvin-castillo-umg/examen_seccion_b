import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"},
        slate: {50:"#f7f8f3",100:"#eef2e9",200:"#dbe4d8",300:"#b8cbbc",400:"#91aa9a",500:"#60786b",600:"#465e52",700:"#304d40",800:"#1d3b30",900:"#102a22",950:"#071a14"},
      },
    },
  },
  plugins: [],
};
export default config;
