// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { createContext, useContext } from "react";
import type { Theme } from "./types.js";
import { THEMES, DEFAULT_THEME } from "./themes.js";

/** React context for the active theme. */
const ThemeContext = createContext<Theme>(THEMES[DEFAULT_THEME]);

/** Provider component that supplies the active theme to descendants. */
export const ThemeProvider = ThemeContext.Provider;

/**
 * Hook to access the current theme within a component.
 * @returns The active theme object.
 */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
