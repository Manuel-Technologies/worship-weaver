import { ProjectionProvider } from "@/contexts/ProjectionContext";
import { DisplaySettingsProvider } from "@/contexts/DisplaySettingsContext";
import { TopBar } from "@/components/TopBar";
import { ServicePanel } from "@/components/ServicePanel";
import { LibraryPanel } from "@/components/LibraryPanel";
import { ListeningPanel } from "@/components/ListeningPanel";
import { SlideArea } from "@/components/SlideArea";
import { LiveOutput } from "@/components/LiveOutput";
import { DisplaySettingsBroadcaster } from "@/components/DisplaySettingsBroadcaster";

const Index = () => {
  return (
    <DisplaySettingsProvider>
      <ProjectionProvider>
        <DisplaySettingsBroadcaster />
        <div className="h-screen flex flex-col overflow-hidden">
          <TopBar />
          <div className="flex-1 flex overflow-hidden">
            {/* Left sidebar - Listening + Library */}
            <div className="w-64 shrink-0 flex flex-col border-r border-border">
              <div className="flex-1 overflow-hidden">
                <ListeningPanel />
              </div>
              <div className="h-72 border-t border-border overflow-hidden">
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
    </DisplaySettingsProvider>
  );
};

export default Index;
