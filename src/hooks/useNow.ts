import { useEffect, useState } from "react";

/**
 * A ticking clock. Returns the current epoch ms, re-rendering every
 * `intervalMs` (default 1s for a live countdown).
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
