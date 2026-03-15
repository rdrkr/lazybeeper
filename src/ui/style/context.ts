// Copyright (c) 2026 lazybeeper by Ronen Druker.

import { createContext, useContext } from "react";
import { Style } from "../../domain/config-file.js";

/** React context for the active visual style. */
const StyleContext = createContext<Style>(Style.Modern);

/** Provider component that supplies the active style to descendants. */
export const StyleProvider = StyleContext.Provider;

/**
 * Hook to access the current visual style within a component.
 * @returns The active style value.
 */
export function useStyle(): Style {
  return useContext(StyleContext);
}
