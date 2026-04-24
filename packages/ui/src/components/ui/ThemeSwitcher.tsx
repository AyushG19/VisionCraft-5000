"use client";
import { useEffect, useState } from "react";
import { Button } from "./button";

export default function ThemeSwitcher({
  theme,
  setTheme,
}: {
  theme: string;
  setTheme: (t: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const themeInfo = [
    {
      name: "default",
      canvas: "#300b43",
      primary: "#a2d2ff",
      secondary: "#bde0fe",
    },
    {
      name: "terra",
      canvas: "#1a1a1a",
      primary: "#4e6851",
      secondary: "#dcc9a9",
    },
    {
      name: "punktown",
      canvas: "#233d4d",
      primary: "#fe7f3d",
      secondary: "#fff2df",
    },
    {
      name: "eyeburn",
      canvas: "#fafafa",
      primary: "#868686",
      secondary: "#e7e6e6",
    },
    {
      name: "batman",
      canvas: "#181818",
      primary: "#e2e2e2",
      secondary: "#3f3f3f",
    },
    {
      name: "lowsun",
      canvas: "#24150f",
      primary: "#85431e",
      secondary: "#d39858",
    },
  ];

  return (
    <div className="flex gap-1.5">
      {themeInfo.map((t) => (
        <Button
          variant={"outline"}
          key={t.name}
          onClick={() => setTheme(t.name)}
          className="w-6 h-6 flex outline-1 outline-global-shadow p-0 overflow-clip"
        >
          <div className="w-3 h-6" style={{ background: t.canvas }} />
          <div className="flex flex-col w-3 h-6">
            <div className="w-3 h-3" style={{ background: t.primary }} />
            <div className="w-3 h-3" style={{ background: t.secondary }} />
          </div>
        </Button>
      ))}
    </div>
  );
}
