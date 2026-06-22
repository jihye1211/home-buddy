import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Settings } from "@/types";
import { loadSettings, saveSettings } from "@/services/settings";
import { setTrayTitle } from "@/services/tray";
import { todayKey } from "@/utils/time";
import { useNow } from "@/hooks/useNow";
import { useAttendance } from "@/hooks/useAttendance";
import { useReminders } from "@/hooks/useReminders";
import { useAutoResize } from "@/hooks/useAutoResize";
import { useRunner } from "@/hooks/useRunner";
import { deriveStatus } from "@/utils/status";
import { formatTrayTitle } from "@/utils/trayTitle";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { Popover } from "@/components/popover/Popover";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

type View = "onboarding" | "popover" | "settings";

/**
 * Root of the menu bar webview. Owns settings, derives live status every
 * second, drives reminders + the tray title, and routes between the three
 * screens.
 */
export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [view, setView] = useState<View>(() =>
    settings.onboarded ? "popover" : "onboarding",
  );

  const now = useNow(1000);
  const attendance = useAttendance(settings);

  const status = useMemo(() => deriveStatus(attendance, now), [attendance, now]);

  // Overtime can be globally disabled; clamp the status so the UI never shows
  // a negative countdown when the user opted out.
  const effectiveStatus = useMemo(() => {
    if (status.isOvertime && !settings.overtimeEnabled) {
      return { ...status, isOvertime: false, remainingMs: 0, phase: "done" as const };
    }
    return status;
  }, [status, settings.overtimeEnabled]);

  useReminders(attendance, now, settings.character);
  useTraySync(effectiveStatus, settings);
  useRunner(effectiveStatus);
  useAutoResize();

  const persist = (next: Settings) => {
    setSettings(saveSettings(next));
  };

  // The user corrected today's clock-in (e.g. after checking the real record).
  const correctClockIn = (time: string) => {
    persist({ ...settings, todayClockIn: { date: todayKey(), time } });
  };

  if (view === "onboarding") {
    return (
      <Onboarding
        initial={settings}
        onComplete={(next) => {
          persist(next);
          setView("popover");
        }}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {view === "settings" ? (
        <SettingsPanel
          key="settings"
          initial={settings}
          onSave={(next) => {
            persist(next);
            setView("popover");
          }}
          onClose={() => setView("popover")}
        />
      ) : (
        <Popover
          key="popover"
          status={effectiveStatus}
          settings={settings}
          onCorrectClockIn={correctClockIn}
          onOpenSettings={() => setView("settings")}
        />
      )}
    </AnimatePresence>
  );
}

/** Keep the menu bar title in sync with the live status and format settings. */
function useTraySync(
  status: ReturnType<typeof deriveStatus>,
  settings: Settings,
): void {
  useEffect(() => {
    void setTrayTitle(formatTrayTitle(status, settings.character, settings.tray));
  }, [status, settings]);
}
