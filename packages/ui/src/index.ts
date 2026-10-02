export const designTokens = {
  color: {
    orange: "#f4511e",
    navy: "#15253e",
    muted: "#64748b",
    line: "#e8edf3",
  },
  radius: { card: "16px", control: "10px" },
};

export { countries } from "./countries";
export type { CountryCode } from "./countries";
export { authenticateDemoAccount, demoAccounts, registerDemoAccount } from "./demoAccounts";
export type { DemoAccount, DemoRole } from "./demoAccounts";
export { applySavedTheme, getThemeMode, setThemeMode, toggleThemeMode } from "./theme";
export type { ThemeMode } from "./theme";
