import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

function applyThemeClass(theme: ThemeMode) {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }
}

function getInitialTheme(): ThemeMode {
  if (typeof window !== "undefined") {
    if (document.documentElement.classList.contains("light")) return "light";
    if (document.documentElement.classList.contains("dark")) return "dark";
    try {
      const stored = localStorage.getItem("oss-funding-theme");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.theme) return parsed.state.theme;
      }
    } catch (e) {}
  }
  return "dark";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      setTheme: (theme: ThemeMode) => {
        applyThemeClass(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const nextTheme = get().theme === "dark" ? "light" : "dark";
        applyThemeClass(nextTheme);
        set({ theme: nextTheme });
      },
    }),
    {
      name: "oss-funding-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeClass(state.theme);
        }
      },
    }
  )
);
