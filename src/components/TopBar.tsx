import { Monitor, MonitorOff, Settings, Keyboard, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjection } from "@/contexts/ProjectionContext";
import { useDisplaySettings } from "@/contexts/DisplaySettingsContext";
import { DisplaySettingsPanel } from "@/components/DisplaySettingsPanel";
import { useState, useEffect } from "react";
import amboProLogo from "@/assets/ambopro-logo.png";

export function TopBar() {
  const { openProjectionWindow, isLive, goBlack, liveScripture, nextVerse, prevVerse } = useProjection();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-sidebar-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src={amboProLogo} alt="AmboPro" className="h-7 w-7 object-contain" />
            <h1 className="text-sm font-bold tracking-tight">AmboPro</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {liveScripture && (
            <div className="flex items-center gap-1 text-[10px] text-primary border border-border rounded-md px-2 py-1">
              <span className="font-medium">{liveScripture.book} {liveScripture.chapter}:{liveScripture.currentVerse}</span>
              <Button size="sm" variant="ghost" className="h-5 w-5 p-0 ml-1" onClick={prevVerse}>
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={nextVerse}>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded-md px-2 py-1">
            <Keyboard className="w-3 h-3" />
            <span>← → Navigate</span>
            <span className="mx-1">|</span>
            <span>Space Next</span>
            <span className="mx-1">|</span>
            <span>B Black</span>
          </div>

          <Button
            size="sm"
            variant={showSettings ? "default" : "outline"}
            className="h-7 text-xs gap-1"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-3 h-3" /> Display
          </Button>
          
          {isLive && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={goBlack}>
              <MonitorOff className="w-3 h-3" /> Black Out
            </Button>
          )}

          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={openProjectionWindow}>
            <Monitor className="w-3.5 h-3.5" /> Open Output
          </Button>
        </div>
      </header>

      {showSettings && (
        <div className="border-b border-border bg-card">
          <DisplaySettingsPanel />
        </div>
      )}
    </>
  );
}
