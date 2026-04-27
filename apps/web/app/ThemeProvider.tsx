"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect } from "react";

const Themes = {
  default: "#300b43",
  terra: "#1a1a1a",
  punktown: "#233d4d",
  eyeburn: "#fafafa",
  batman: "#181818",
  lowsun: "#24150f",
};

function ThemeMetaSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = Themes[resolvedTheme as keyof typeof Themes];
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="default"
      enableSystem={false}
      disableTransitionOnChange
      themes={Object.values(Themes)} // List your themes here
    >
      <ThemeMetaSync />
      {children}
    </NextThemesProvider>
  );
}
