// packages/tailwind-config/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "../../apps/web/app/**/*.{js,jsx,ts,tsx}",
    "../ui/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // add your shared theme customizations here (colors, fonts, etc.)
    },
  },
  plugins: [
    // add any shared Tailwind plugins here (forms, typography, etc.)
  ],
};
export default config;
