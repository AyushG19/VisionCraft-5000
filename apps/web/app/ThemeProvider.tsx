// app/components/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      themes={["light", "dark", "neon", "white", "black", "candy"]} // List your themes here
    >
      {children}
    </NextThemesProvider>
  );
}
