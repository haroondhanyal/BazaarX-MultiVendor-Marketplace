export type ThemeMode = "light" | "dark";

const themeKey = "bx-theme-mode";

export function getThemeMode(): ThemeMode {
  try {
    return localStorage.getItem(themeKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function setThemeMode(mode: ThemeMode): ThemeMode {
  document.documentElement.dataset.theme = mode;
  try {
    localStorage.setItem(themeKey, mode);
  } catch {
    // The theme still applies for this page when browser storage is disabled.
  }
  return mode;
}

export function applySavedTheme(): ThemeMode {
  return setThemeMode(getThemeMode());
}

export function toggleThemeMode(): ThemeMode {
  return setThemeMode(getThemeMode() === "dark" ? "light" : "dark");
}
