import { useEffect } from "react";
import { isTauri } from "@/services/tauri";
import { setWindowSize } from "@/services/window";

const WIDTH = 300;
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 760;

/**
 * Keep the transparent popover window sized to its content, so no view ever
 * scrolls or leaves empty space. Observes the root element and resizes the
 * native window to match its height.
 */
export function useAutoResize(): void {
  useEffect(() => {
    if (!isTauri()) return;
    const root = document.getElementById("root");
    if (!root) return;

    let raf = 0;
    const apply = () => {
      const height = Math.min(
        MAX_HEIGHT,
        Math.max(MIN_HEIGHT, Math.ceil(root.scrollHeight)),
      );
      void setWindowSize(WIDTH, height);
    };

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    });
    observer.observe(root);
    apply();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
}
