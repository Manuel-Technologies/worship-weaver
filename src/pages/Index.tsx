import { useState } from "react";
import { ProjectionProvider } from "@/contexts/ProjectionContext";
import { DisplaySettingsProvider } from "@/contexts/DisplaySettingsContext";
import { TopBar } from "@/components/TopBar";
import { IconSidebar } from "@/components/IconSidebar";
import { ServicePanel } from "@/components/ServicePanel";
import { LibraryPanel } from "@/components/LibraryPanel";
import { ListeningPanel } from "@/components/ListeningPanel";
import { SlideArea } from "@/components/SlideArea";
import { LiveOutput } from "@/components/LiveOutput";
import { DisplaySettingsBroadcaster } from "@/components/DisplaySettingsBroadcaster";
import { DisplaySettingsPanel } from "@/components/DisplaySettingsPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <DisplaySettingsProvider>
      <ProjectionProvider>
        <DisplaySettingsBroadcaster />
        <div className="h-screen flex flex-col overflow-hidden">
          <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 flex overflow-hidden">
            {/* Icon Sidebar */}
            <IconSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content Area */}
            {activeTab === "dashboard" && <DashboardView />}
            {activeTab === "scripture" && <ScriptureView />}
            {activeTab === "library" && <LibraryView />}
            {activeTab === "settings" && <SettingsView />}
          </div>
        </div>
      </ProjectionProvider>
    </DisplaySettingsProvider>
  );
};

function DashboardView() {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel - Auto-Scripture Listener */}
      <div className="w-[360px] shrink-0 flex flex-col border-r border-border bg-card">
        <ListeningPanel />
      </div>

      {/* Center - Live Output / Confidence Monitor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col">
          <LiveOutput />
        </div>
        {/* Slide strip at bottom */}
        <div className="h-[180px] border-t border-border">
          <SlideArea />
        </div>
      </div>

      {/* Right panel - Service Order */}
      <div className="w-[280px] shrink-0 border-l border-border">
        <ServicePanel />
      </div>
    </div>
  );
}

function ScriptureView() {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel - Search/Browse */}
      <div className="w-[320px] shrink-0 flex flex-col border-r border-border bg-card">
        <LibraryPanel />
      </div>

      {/* Center - Slide preview area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <SlideArea />
      </div>

      {/* Right panel - Live Output & Display Settings */}
      <div className="w-[300px] shrink-0 border-l border-border flex flex-col">
        <div className="flex-1">
          <LiveOutput />
        </div>
        <div className="border-t border-border">
          <DisplaySettingsPanel />
        </div>
      </div>
    </div>
  );
}

function LibraryView() {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[360px] shrink-0 flex flex-col border-r border-border bg-card">
        <LibraryPanel />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <SlideArea />
      </div>
      <div className="w-[280px] shrink-0 border-l border-border">
        <LiveOutput />
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground mb-6">Display Settings</h2>
        <div className="max-w-lg">
          <DisplaySettingsPanel />
        </div>
      </div>
    </div>
  );
}

export default Index;
