import { isTauri, safeInvoke } from "./tauri";

/** Open a URL in the user's default browser (or a new tab in a plain browser). */
export async function openUrl(url: string): Promise<void> {
  const u = url.trim();
  if (!u) return;
  if (isTauri()) {
    await safeInvoke("open_external", { url: u });
  } else {
    window.open(u, "_blank", "noopener");
  }
}
