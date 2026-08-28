"use client";

import { useThemeStore } from "@/lib/useThemeStore";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-1.5 rounded-none border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-slate-600 dark:text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
    >
      {isDark ? (
        <>
          <Moon className="h-3 w-3 text-violet-400" />
          <span>DARK</span>
        </>
      ) : (
        <>
          <Sun className="h-3 w-3 text-amber-500" />
          <span>LIGHT</span>
        </>
      )}
    </button>
  );
}
