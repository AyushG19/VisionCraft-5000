"use client";

import { useEffect, useState } from "react";

export default function ThemeSwitcher({
  theme,
  setTheme,
}: {
  theme: any;
  setTheme: any;
}) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="p-2 border-2 border-primary rounded-md bg-background text-foreground absolute top-0 left-0 "
    >
      <option value="light">Light Mode</option>
      <option value="dark">Dark Mode</option>
      <option value="neon">Neon Mode</option>
      <option value="white">White Mode</option>
      <option value="black">Black Mode</option>
    </select>
  );
}
