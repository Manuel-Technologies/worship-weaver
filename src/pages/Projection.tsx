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
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-5xl w-full">
        {slide.reference && (
          <div
            className="font-semibold mb-4"
            style={{ color: "hsl(210, 100%, 55%)", fontSize: Math.round(displaySettings.fontSize * 0.5) }}
          >
            {slide.reference}
          </div>
        )}
        {slide.title && (
          <div
            className="font-bold mb-6 uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: Math.round(displaySettings.fontSize * 0.45) }}
          >
            {slide.title}
          </div>
        )}
        {slide.bodyLines.map((line, i) => (
          <p
            key={i}
            className="font-semibold leading-relaxed"
            style={{ color: "#fff", fontSize: displaySettings.fontSize }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* AmboPro Watermark */}
      <div className="absolute bottom-6 right-8 z-20 select-none pointer-events-none flex items-center gap-2">
        <img src="/favicon.png" alt="" className="h-6 w-6 object-contain" style={{ opacity: 0.18 }} />
        <span
          style={{
            fontSize: "28px",
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: "rgba(255, 255, 255, 0.12)",
            textTransform: "uppercase",
          }}
        >
          AmboPro
        </span>
      </div>
    </div>
  );
};

export default ProjectionPage;
