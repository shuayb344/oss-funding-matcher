"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/useThemeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme && !root.classList.contains(theme)) {
      root.classList.remove("dark", "light");
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
