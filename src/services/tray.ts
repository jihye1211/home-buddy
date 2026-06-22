import { safeInvoke } from "./tauri";

/**
 * Update the menu bar title (the short text next to the tray icon), e.g.
 * "🐰 2h13m" or "🔥 +42m". No-op outside Tauri.
 */
export async function setTrayTitle(title: string): Promise<void> {
  await safeInvoke("set_tray_title", { title });
}
