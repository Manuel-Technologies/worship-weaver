import { useProjection } from "@/contexts/ProjectionContext";
import { SlidePreview } from "@/components/SlidePreview";
import { Button } from "@/components/ui/button";
import { Play, MonitorOff, ChevronLeft, ChevronRight } from "lucide-react";

export function SlideArea() {
  const {
    serviceItems, currentItemIndex, currentSlideIndex,
    selectSlide, goLive, goBlack, nextSlide, prevSlide,
    liveSlide, currentSlide,
  } = useProjection();

  const item = serviceItems[currentItemIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Main preview */}
      <div className="flex-1 flex flex-col">
        <div className="panel-header">
          <span className="panel-header-title">Preview</span>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={prevSlide}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={nextSlide}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 bg-card">
          {currentSlide ? (
            <div className="w-full max-w-2xl">
              <SlidePreview slide={currentSlide} size="lg" />
              <div className="flex items-center justify-center gap-2 mt-3">
                <Button
                  size="sm"
                  className="gap-1.5 bg-live hover:bg-live/90"
                  onClick={() => goLive(currentSlide)}
                >
                  <Play className="w-3.5 h-3.5" /> GO LIVE
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={goBlack}>
                  <MonitorOff className="w-3.5 h-3.5" /> Black
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No slide selected</p>
              <p className="text-xs mt-1">Add items from the library</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide strip */}
      {item && (
        <div className="border-t border-border bg-card">
          <div className="panel-header py-1.5">
            <span className="panel-header-title text-[10px]">{item.title} — Slides</span>
            <span className="text-[10px] text-muted-foreground">{item.slides.length}</span>
          </div>
          <div className="flex gap-1.5 p-2 overflow-x-auto">
            {item.slides.map((slide, idx) => (
              <div key={slide.id} className="w-28 shrink-0">
                <SlidePreview
                  slide={slide}
                  isActive={idx === currentSlideIndex}
                  isLive={liveSlide?.id === slide.id}
                  onClick={() => selectSlide(currentItemIndex, idx)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
