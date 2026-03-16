// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Empty module used as a build-time replacement for dependencies
 * that are not needed in the browser build (e.g. smol-toml).
 */
const placeholder: Record<string, never> = {};
export default placeholder;
