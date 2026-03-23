import { useEffect, useState } from "react";
import { SlideData } from "@/lib/service-types";

const ProjectionPage = () => {
  const [slide, setSlide] = useState<SlideData | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "SLIDE_UPDATE") {
        setSlide(event.data.slide);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!slide || slide.background === "black") {
    return <div className="w-screen h-screen" style={{ background: "#000" }} />;
  }

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center p-16 text-center"
      style={{ background: slide.background || "#0a0e1a" }}
    >
      {slide.reference && (
        <div className="text-2xl font-semibold mb-4" style={{ color: "hsl(210, 100%, 55%)" }}>
          {slide.reference}
        </div>
      )}
      {slide.title && (
        <div className="text-xl font-bold mb-6 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
          {slide.title}
        </div>
      )}
      <div className="max-w-5xl">
        {slide.bodyLines.map((line, i) => (
          <p key={i} className="text-5xl font-semibold leading-relaxed" style={{ color: "#fff" }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ProjectionPage;
