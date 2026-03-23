import { ProjectionProvider } from "@/contexts/ProjectionContext";
import { TopBar } from "@/components/TopBar";
import { ServicePanel } from "@/components/ServicePanel";
import { LibraryPanel } from "@/components/LibraryPanel";
import { SlideArea } from "@/components/SlideArea";
import { LiveOutput } from "@/components/LiveOutput";

const Index = () => {
  return (
    <ProjectionProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - Service Order + Library */}
          <div className="w-64 shrink-0 flex flex-col border-r border-border">
            <div className="flex-1 overflow-hidden">
              <ServicePanel />
            </div>
            <div className="h-80 border-t border-border overflow-hidden">
              <LibraryPanel />
            </div>
          </div>

          {/* Center - Slide area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <SlideArea />
          </div>

          {/* Right sidebar - Live output */}
          <div className="w-72 shrink-0 border-l border-border">
            <LiveOutput />
          </div>
        </div>
      </div>
    </ProjectionProvider>
  );
};

export default Index;
