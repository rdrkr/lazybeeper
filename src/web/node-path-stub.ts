// Copyright (c) 2026 lazybeeper by Ronen Druker.

/**
 * Minimal browser stub for node:path.
 * Provides join and dirname which are the only functions used by the mock data module.
 */

/**
 * Joins path segments with forward slashes, normalizing redundant separators.
 * Mimics Node's path.join behavior for the subset used by the mock data module.
 * @param segments - The path segments to join.
 * @returns The joined path string.
 */
export function join(...segments: string[]): string {
  const raw = segments.filter(Boolean).join("/");
  return raw.replace(/\/{2,}/g, "/");
}

/**
 * Returns the directory portion of a path.
 * @param p - The path to extract the directory from.
 * @returns The directory path.
 */
export function dirname(p: string): string {
  const idx = p.lastIndexOf("/");
  if (idx <= 0) {
    return idx === 0 ? "/" : ".";
  }
  return p.substring(0, idx);
}

export default { join, dirname };
