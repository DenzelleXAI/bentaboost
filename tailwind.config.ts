import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff6ea",
        graphite: "#221f1f",
        ember: "#f05a28",
        tangerine: "#ff8a2a",
        coral: "#ff4f3a"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(94, 58, 24, 0.12)",
        card: "0 18px 45px rgba(34, 31, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
