import { BookOpen, Music2, Film, Settings, Mic } from "lucide-react";

interface IconSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isListening?: boolean;
}

const NAV_ITEMS = [
  { id: "dashboard", icon: Mic, label: "LIVE" },
  { id: "scripture", icon: BookOpen, label: "BIBLE" },
  { id: "library", icon: Music2, label: "SONGS" },
  { id: "media", icon: Film, label: "MEDIA" },
  { id: "settings", icon: Settings, label: "SETTINGS" },
];

export function IconSidebar({ activeTab, onTabChange, isListening }: IconSidebarProps) {
  return (
    <div className="w-[72px] shrink-0 flex flex-col items-center py-3 gap-1 border-r border-border" style={{ background: "hsl(222, 47%, 6%)" }}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`sidebar-nav-item w-14 relative ${activeTab === item.id ? "active" : ""}`}
        >
          <item.icon className="w-5 h-5" />
          <span className="nav-label">{item.label}</span>
          {item.id === "dashboard" && isListening && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-live animate-pulse" />
          )}
        </button>
      ))}

      {/* Bottom GO LIVE button */}
      <div className="mt-auto pt-3">
        <button
          onClick={() => onTabChange("dashboard")}
          className="flex items-center justify-center px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
        >
          GO LIVE
        </button>
      </div>
    </div>
  );
}
