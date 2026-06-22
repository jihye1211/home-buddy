import { isTauri } from "./tauri";

/** Resize the popover window (logical pixels). No-op outside Tauri. */
export async function setWindowSize(
  width: number,
  height: number,
): Promise<void> {
  if (!isTauri()) return;
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const { LogicalSize } = await import("@tauri-apps/api/dpi");
    await getCurrentWindow().setSize(new LogicalSize(width, height));
  } catch (err) {
    console.warn("[window] setSize failed:", err);
  }
}
