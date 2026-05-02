import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand color = emerald, matching grid.golivio.com and the Livio Land
        // helmet+Land logo. Every bg-brand-* / text-brand-* / border-brand-*
        // resolves to a consistent emerald shade across the platform.
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          900: "#064e3b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
