import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        grid: {
          950: "#07111f",
          600: "#2563eb"
        }
      }
    }
  },
  plugins: []
};

export default config;
