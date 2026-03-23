import { useProjection } from "@/contexts/ProjectionContext";
import { SlidePreview } from "@/components/SlidePreview";

export function LiveOutput() {
  const { liveSlide } = useProjection();

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="panel-header-title">Live Output</span>
          {liveSlide && <span className="live-badge">LIVE</span>}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-3 bg-card">
        {liveSlide ? (
          <div className="w-full">
            <SlidePreview slide={liveSlide} size="md" />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center">
            <p>No live output</p>
            <p className="mt-1 text-[10px]">Click GO LIVE to project</p>
          </div>
        )}
      </div>
    </div>
  );
}
