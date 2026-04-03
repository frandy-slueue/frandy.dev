"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { settingsApi } from "@/lib/api";
import {
  applyTheme, storeTheme, getStoredTheme, getStoredMode,
  Theme, Mode, THEMES, MODES,
} from "@/lib/theme";

interface ThemeCtx {
  theme: Theme;
  mode:  Mode;
  setTheme: (t: Theme) => void;
  setMode:  (m: Mode)  => void;
  setThemeAndMode: (t: Theme, m: Mode) => void;
}

const Ctx = createContext<ThemeCtx>({
  theme:"silver", mode:"dark",
  setTheme:()=>{}, setMode:()=>{}, setThemeAndMode:()=>{},
});

export function useTheme() { return useContext(Ctx); }

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("silver");
  const [mode,  setModeState]  = useState<Mode>("dark");

  useEffect(() => {
    // 1. Check localStorage first (user preference wins)
    const storedTheme = getStoredTheme();
    const storedMode  = getStoredMode();

    if (storedTheme && storedMode) {
      setThemeState(storedTheme);
      setModeState(storedMode);
      applyTheme(storedTheme, storedMode);
      return;
    }

    // 2. Fall back to admin-set default
    settingsApi.getTheme()
      .then((data) => {
        const t = (THEMES.includes(data.active_theme as Theme) ? data.active_theme : "silver") as Theme;
        const m = (MODES.includes(data.theme_mode as Mode)     ? data.theme_mode   : "dark")   as Mode;
        setThemeState(t); setModeState(m);
        applyTheme(t, m);
      })
      .catch(() => { applyTheme("silver", "dark"); });
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t, mode);
    storeTheme(t, mode);
  }, [mode]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    applyTheme(theme, m);
    storeTheme(theme, m);
  }, [theme]);

  const setThemeAndMode = useCallback((t: Theme, m: Mode) => {
    setThemeState(t); setModeState(m);
    applyTheme(t, m);
    storeTheme(t, m);
  }, []);

  return (
    <Ctx.Provider value={{ theme, mode, setTheme, setMode, setThemeAndMode }}>
      {children}
    </Ctx.Provider>
  );
}
