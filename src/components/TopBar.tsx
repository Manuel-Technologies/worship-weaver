import { Monitor, MonitorOff, Settings, Cast, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjection } from "@/contexts/ProjectionContext";
import { useDisplaySettings } from "@/contexts/DisplaySettingsContext";
import { DisplaySettingsPanel } from "@/components/DisplaySettingsPanel";
import { useState } from "react";
import amboProLogo from "@/assets/ambopro-logo.png";

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "scripture", label: "Scripture" },
  { id: "library", label: "Library" },
];

export function TopBar({ activeTab, onTabChange }: TopBarProps) {
  const { openProjectionWindow, isLive, goBlack, liveScripture, nextVerse, prevVerse } = useProjection();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-5" style={{ background: "hsl(222, 47%, 6%)" }}>
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src={amboProLogo} alt="AmboPro" className="h-7 w-7 object-contain" />
            <h1 className="text-base font-extrabold tracking-tight text-primary">AMBOPRO</h1>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {liveScripture && (
            <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 rounded-lg px-3 py-1.5 border border-primary/20">
              <span className="font-semibold">{liveScripture.book} {liveScripture.chapter}:{liveScripture.currentVerse}</span>
              <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={prevVerse}>
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={nextVerse}>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <Cast className="w-4 h-4" />
          </Button>

          {isLive && (
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border" onClick={goBlack}>
              <MonitorOff className="w-3.5 h-3.5" /> Black
            </Button>
          )}

          <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={openProjectionWindow}>
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
