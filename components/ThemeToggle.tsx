"use client";

import { useThemeStore } from "@/lib/useThemeStore";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const isDark = theme === "dark";
  const label = isDark ? "Dark" : "Light";

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
      title={`Theme: ${label}`}
    >
      {isDark ? (
        <Moon className="h-3.5 w-3.5" />
      ) : (
        <Sun className="h-3.5 w-3.5 text-amber-500" />
      )}
      {label}
    </button>
  );
}
