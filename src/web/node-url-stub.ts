// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Minimal browser stub for node:url.
 * Provides fileURLToPath which is the only function used by the mock data module.
 */

/**
 * Extracts the pathname from a URL string.
 * In the browser, import.meta.url is an HTTP URL (e.g. http://host/entry.js),
 * so we extract just the pathname portion to produce relative asset paths.
 * @param url - The URL string or URL object to convert.
 * @returns The pathname portion of the URL.
 */
export function fileURLToPath(url: string | URL): string {
  const str = typeof url === "string" ? url : url.href;
  try {
    return new URL(str).pathname;
  } catch {
    return str.replace(/^file:\/\//, "");
  }
}
