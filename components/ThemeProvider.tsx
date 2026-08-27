"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/lib/useThemeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  // Prevent flash before hydration
  if (!mounted) {
    return <div className="dark">{children}</div>;
  }

  return <>{children}</>;
}
