import { isTauri } from "./tauri";

/**
 * Send a desktop notification through the Tauri notification plugin, requesting
 * permission on first use. Falls back to the Web Notification API when running
 * in a plain browser, and to a console log if neither is available.
 */
export async function notify(title: string, body: string): Promise<void> {
  if (isTauri()) {
    await notifyTauri(title, body);
    return;
  }
  notifyWeb(title, body);
}

async function notifyTauri(title: string, body: string): Promise<void> {
  try {
    const plugin = await import("@tauri-apps/plugin-notification");
    let granted = await plugin.isPermissionGranted();
    if (!granted) {
      granted = (await plugin.requestPermission()) === "granted";
    }
    if (granted) {
      plugin.sendNotification({ title, body });
    }
  } catch (err) {
    console.warn("[notify] tauri notification failed:", err);
  }
}

function notifyWeb(title: string, body: string): void {
  if (typeof Notification === "undefined") {
    console.info(`[notify] ${title} — ${body}`);
    return;
  }
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    void Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(title, { body });
    });
  }
}
