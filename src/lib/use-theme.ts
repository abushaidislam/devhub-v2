"use client";

import {useCallback, useEffect, useState} from "react";
import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  THEME_EVENT,
  type Theme,
  type ThemePreference,
  writeThemePreference,
} from "./theme";

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const sync = () => {
      const nextPreference = readThemePreference();
      const nextTheme = resolveTheme(nextPreference);
      setPreference(nextPreference);
      setTheme(nextTheme);
      applyTheme(nextTheme);
    };

    sync();
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", sync);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      if (readThemePreference() === "system") sync();
    };
    media.addEventListener("change", onMediaChange);

    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", sync);
      media.removeEventListener("change", onMediaChange);
    };
  }, []);

  const setThemePreference = useCallback((next: ThemePreference) => {
    writeThemePreference(next);
    const resolved = resolveTheme(next);
    setPreference(next);
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    const resolved = resolveTheme(readThemePreference());
    setThemePreference(resolved === "dark" ? "light" : "dark");
  }, [setThemePreference]);

  return {theme, preference, setThemePreference, toggleTheme, isDark: theme === "dark"};
}
