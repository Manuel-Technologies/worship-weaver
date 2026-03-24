import { useEffect } from "react";
import { useDisplaySettings } from "@/contexts/DisplaySettingsContext";
import { useProjection } from "@/contexts/ProjectionContext";

export function DisplaySettingsBroadcaster() {
  const { settings } = useDisplaySettings();
  const { projectionWindow } = useProjection();

  useEffect(() => {
    if (projectionWindow && !projectionWindow.closed) {
      projectionWindow.postMessage({ type: "DISPLAY_SETTINGS_UPDATE", settings }, "*");
    }
  }, [settings, projectionWindow]);

  return null;
}
