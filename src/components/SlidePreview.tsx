import { SlideData } from "@/lib/service-types";

interface SlidePreviewProps {
  slide: SlideData;
  isActive?: boolean;
  isLive?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function SlidePreview({ slide, isActive, isLive, onClick, onDoubleClick, size = "sm" }: SlidePreviewProps) {
  const sizeClasses = {
    sm: "w-full aspect-video",
    md: "w-full aspect-video",
    lg: "w-full aspect-video",
  };

  const fontSizes = {
    sm: { title: "text-[8px]", body: "text-[6px]", ref: "text-[5px]" },
    md: { title: "text-xs", body: "text-[9px]", ref: "text-[7px]" },
    lg: { title: "text-lg", body: "text-sm", ref: "text-xs" },
  };

  const f = fontSizes[size];

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`slide-thumbnail ${sizeClasses[size]} relative ${
        isActive ? "slide-thumbnail-active" : "slide-thumbnail-inactive"
      }`}
    >
      <div
        className="absolute inset-0 projection-slide p-2 overflow-hidden"
        style={{ background: slide.background || "hsl(225, 20%, 6%)" }}
      >
        {slide.reference && (
          <div className={`${f.ref} text-primary font-semibold mb-0.5`}>{slide.reference}</div>
        )}
        {slide.title && (
          <div className={`${f.title} font-bold mb-0.5 leading-tight`} style={{ color: "white" }}>
            {slide.title}
          </div>
        )}
        <div className="flex-1 flex flex-col justify-center">
          {slide.bodyLines.map((line, i) => (
            <div key={i} className={`${f.body} leading-tight`} style={{ color: "rgba(255,255,255,0.95)" }}>
              {line}
            </div>
          ))}
        </div>
      </div>
      {isLive && (
        <div className="absolute top-1 right-1">
          <span className="live-badge text-[6px] px-1 py-0">LIVE</span>
        </div>
      )}
    </div>
  );
}
