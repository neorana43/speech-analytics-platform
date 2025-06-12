import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#696969",
        "light-midnight": "#B7B7B7",
        "light-gray": "#9B9B9B",
        light: "#ebebeb",
        primary: "#EC692D",
        secondary: "#4e598c",
        dark: "#717171",
      },
      keyframes: {
        "slide-in-left": {
          "0%": { transform: "translateX(-20%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-20%)", opacity: "0" },
        },
      },
      animation: {
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-out-left": "slide-out-left 0.2s ease-in",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
