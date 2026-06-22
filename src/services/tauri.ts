/**
 * Thin guards around Tauri APIs so the same React code runs in the menu bar
 * webview and in a plain browser tab (for design/preview) without crashing.
 */

/** True when running inside a Tauri webview. */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Lazily invoke a Tauri command. Resolves to `undefined` (and warns) when not
 * running under Tauri, so callers can stay agnostic.
 */
export async function safeInvoke<T = unknown>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T | undefined> {
  if (!isTauri()) return undefined;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(command, args);
  } catch (err) {
    console.warn(`[tauri] invoke "${command}" failed:`, err);
    return undefined;
  }
}
