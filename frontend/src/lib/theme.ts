export const THEMES = ["silver","cobalt","ember","jade"] as const;
export const MODES  = ["dark","light"] as const;
export type Theme = typeof THEMES[number];
export type Mode  = typeof MODES[number];

const LS_THEME = "frandy-theme";
const LS_MODE  = "frandy-mode";

export function applyTheme(theme: Theme, mode: Mode = "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-mode",  mode);
}

export function getStoredTheme(): Theme | null {
  try {
    const t = localStorage.getItem(LS_THEME);
    return THEMES.includes(t as Theme) ? (t as Theme) : null;
  } catch { return null; }
}

export function getStoredMode(): Mode | null {
  try {
    const m = localStorage.getItem(LS_MODE);
    return MODES.includes(m as Mode) ? (m as Mode) : null;
  } catch { return null; }
}

export function storeTheme(theme: Theme, mode: Mode) {
  try {
    localStorage.setItem(LS_THEME, theme);
    localStorage.setItem(LS_MODE,  mode);
  } catch {}
}

export function getAppliedTheme(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return THEMES.includes(t as Theme) ? (t as Theme) : "silver";
}

export function getAppliedMode(): Mode {
  const m = document.documentElement.getAttribute("data-mode");
  return m === "light" ? "light" : "dark";
}
