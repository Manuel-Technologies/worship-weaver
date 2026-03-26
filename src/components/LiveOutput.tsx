import { useProjection } from "@/contexts/ProjectionContext";
import { SlidePreview } from "@/components/SlidePreview";

export function LiveOutput() {
  const { liveSlide, isLive, liveScripture } = useProjection();

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="panel-header-title">Live Output</span>
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-live text-live-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-live-foreground animate-pulse" />
              ON-AIR
            </span>
          )}
        </div>
        {liveScripture && (
          <span className="text-[10px] text-primary font-semibold">
            {liveScripture.book} {liveScripture.chapter}:{liveScripture.currentVerse}
          </span>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center p-4 bg-card">
        {liveSlide ? (
          <div className="w-full">
            <SlidePreview slide={liveSlide} size="md" />
            <div className="mt-2 flex items-center justify-center">
              <span className="live-badge">LIVE ON STAGE</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-10 rounded-lg bg-secondary mx-auto mb-3 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground">16:9</span>
            </div>
            <p className="text-xs text-muted-foreground">No live output</p>
            <p className="mt-1 text-[10px] text-muted-foreground/60">Select a slide to project</p>
          </div>
        )}
      </div>
    </div>
  );
}
