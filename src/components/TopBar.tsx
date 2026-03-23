import { Monitor, MonitorOff, Settings, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjection } from "@/contexts/ProjectionContext";

export function TopBar() {
  const { openProjectionWindow, isLive, goBlack } = useProjection();

  return (
    <header className="h-12 border-b border-border flex items-center justify-between px-4" style={{ background: "hsl(225, 15%, 8%)" }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">AmboPro</h1>
            <p className="text-[9px] text-muted-foreground -mt-0.5">Church Projection Software</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded-md px-2 py-1">
          <Keyboard className="w-3 h-3" />
          <span>← → Navigate</span>
          <span className="mx-1">|</span>
          <span>Space Next</span>
          <span className="mx-1">|</span>
          <span>B Black</span>
        </div>
        
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
  );
}
