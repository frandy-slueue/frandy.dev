export const THEMES = ["silver", "cobalt", "ember", "jade"] as const;
export type Theme = (typeof THEMES)[number];

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function getThemeFromAttribute(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return (THEMES.includes(t as Theme) ? t : "silver") as Theme;
}
