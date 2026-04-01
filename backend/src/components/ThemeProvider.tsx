"use client";

import { useEffect } from "react";
import { settingsApi } from "@/lib/api";
import { applyTheme, Theme } from "@/lib/theme";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    settingsApi
      .getTheme()
      .then((data) => applyTheme(data.active_theme as Theme))
      .catch(() => applyTheme("silver"));
  }, []);

  return <>{children}</>;
}
