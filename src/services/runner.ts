import { safeInvoke } from "./tauri";

/** Set the menu bar icon animation speed (frames-per-second). No-op in browser. */
export async function setRunSpeed(fps: number): Promise<void> {
  await safeInvoke("set_run_speed", { fps });
}
