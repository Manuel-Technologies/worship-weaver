import React, { createContext, useContext, useState, useCallback } from "react";

export interface DisplaySettings {
  theme: "dark" | "midnight" | "warm" | "nature" | "royal";
  fontSize: number; // px for body text on projection
  fontAlign: "left" | "center" | "right";
  backgroundImage: string | null; // data URL or null
}

const THEME_BACKGROUNDS: Record<DisplaySettings["theme"], string> = {
  dark: "hsl(225, 20%, 6%)",
  midnight: "hsl(230, 35%, 8%)",
  warm: "hsl(25, 30%, 10%)",
  nature: "hsl(150, 20%, 8%)",
  royal: "hsl(270, 30%, 10%)",
};

export function getThemeBackground(settings: DisplaySettings): string {
  return THEME_BACKGROUNDS[settings.theme];
}

interface DisplaySettingsContextType {
  settings: DisplaySettings;
  updateSettings: (partial: Partial<DisplaySettings>) => void;
}

const DisplaySettingsContext = createContext<DisplaySettingsContextType | null>(null);

export function useDisplaySettings() {
  const ctx = useContext(DisplaySettingsContext);
  if (!ctx) throw new Error("useDisplaySettings must be used within DisplaySettingsProvider");
  return ctx;
}

const DEFAULT_SETTINGS: DisplaySettings = {
  theme: "dark",
  fontSize: 48,
  fontAlign: "center",
  backgroundImage: null,
};

export function DisplaySettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((partial: Partial<DisplaySettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <DisplaySettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}
