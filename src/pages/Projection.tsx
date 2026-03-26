import { useEffect, useState } from "react";
import { SlideData } from "@/lib/service-types";
import { DisplaySettings, getThemeBackground } from "@/contexts/DisplaySettingsContext";

const ProjectionPage = () => {
  const [slide, setSlide] = useState<SlideData | null>(null);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    theme: "dark",
    fontSize: 48,
    fontAlign: "center",
    backgroundImage: null,
  });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "SLIDE_UPDATE") {
        setSlide(event.data.slide);
      }
      if (event.data?.type === "DISPLAY_SETTINGS_UPDATE") {
        setDisplaySettings(event.data.settings);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!slide || slide.background === "black") {
    return <div className="w-screen h-screen" style={{ background: "#000" }} />;
  }

  const bgColor = getThemeBackground(displaySettings);
  const alignClass =
    displaySettings.fontAlign === "left" ? "text-left items-start" :
    displaySettings.fontAlign === "right" ? "text-right items-end" :
    "text-center items-center";

  return (
    <div
      className={`w-screen h-screen flex flex-col justify-center p-16 relative overflow-hidden ${alignClass}`}
      style={{
        background: displaySettings.backgroundImage
          ? `url(${displaySettings.backgroundImage}) center/cover no-repeat`
          : bgColor,
      }}
    >
      {/* Dark overlay for background images */}
      {displaySettings.backgroundImage && (
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-5xl w-full">
        {slide.bodyLines.map((line, i) => (
          <p
            key={i}
            className="font-extrabold leading-tight"
            style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: displaySettings.fontSize,
              textShadow: "0 4px 24px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            {line}
          </p>
        ))}

        {/* Reference with decorative lines */}
        {slide.reference && (
          <div className="flex items-center gap-4 mt-8" style={{ justifyContent: displaySettings.fontAlign === "left" ? "flex-start" : displaySettings.fontAlign === "right" ? "flex-end" : "center" }}>
            <div className="w-8 h-px" style={{ background: "hsl(40, 90%, 52%)" }} />
            <span
              className="font-bold uppercase tracking-[0.2em]"
              style={{
                color: "hsl(40, 90%, 52%)",
                fontSize: Math.round(displaySettings.fontSize * 0.4),
              }}
            >
              {slide.reference}
            </span>
            <div className="w-8 h-px" style={{ background: "hsl(40, 90%, 52%)" }} />
          </div>
        )}

        {slide.title && (
          <div
            className="font-semibold mt-2 uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: Math.round(displaySettings.fontSize * 0.35) }}
          >
            {slide.title}
          </div>
        )}
      </div>

      {/* AmboPro Watermark - top left */}
      <div className="absolute top-6 left-8 z-20 select-none pointer-events-none">
        <div
          style={{
            fontSize: "16px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "rgba(255, 255, 255, 0.15)",
            textTransform: "uppercase",
          }}
        >
          AMBOPRO
        </div>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: "rgba(255, 255, 255, 0.1)",
            textTransform: "uppercase",
          }}
        >
          SANCTUARY LIVE
        </div>
      </div>

      {/* ON-AIR indicator - top right */}
      <div className="absolute top-6 right-8 z-20 select-none pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: "rgba(80, 200, 120, 0.5)" }} />
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "rgba(255, 255, 255, 0.12)",
            textTransform: "uppercase",
          }}
        >
          ON-AIR
        </span>
      </div>
    </div>
  );
};

export default ProjectionPage;
