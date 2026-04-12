// app/components/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      themes={["default", "terra", "punktown", "eyeburn", "batman", "lowsun"]} // List your themes here
    >
      {children}
    </NextThemesProvider>
  );
}
