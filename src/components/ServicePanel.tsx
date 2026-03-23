import { Book, Music, Megaphone, Image, MonitorOff, ChevronUp, ChevronDown, X } from "lucide-react";
import { useProjection } from "@/contexts/ProjectionContext";
import { ServiceItemType } from "@/lib/service-types";

const typeIcons: Record<ServiceItemType, React.ReactNode> = {
  scripture: <Book className="w-4 h-4 text-primary" />,
  song: <Music className="w-4 h-4 text-accent" />,
  announcement: <Megaphone className="w-4 h-4 text-success" />,
  media: <Image className="w-4 h-4 text-muted-foreground" />,
  blank: <MonitorOff className="w-4 h-4 text-muted-foreground" />,
};

export function ServicePanel() {
  const { serviceItems, currentItemIndex, selectItem, removeServiceItem, moveServiceItem } = useProjection();

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-header-title">Service Order</span>
        <span className="text-xs text-muted-foreground">{serviceItems.length} items</span>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {serviceItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2 py-8">
            <Book className="w-8 h-8 opacity-40" />
            <p>No items yet</p>
            <p className="text-xs">Add scripture or songs below</p>
          </div>
        ) : (
          serviceItems.map((item, index) => (
            <div
              key={item.id}
              className={`service-item group ${index === currentItemIndex ? "service-item-active" : ""}`}
              onClick={() => selectItem(index)}
            >
              {typeIcons[item.type]}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.title}</div>
                {item.subtitle && (
                  <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                )}
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); if (index > 0) moveServiceItem(index, index - 1); }}
                  className="p-0.5 rounded hover:bg-secondary"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (index < serviceItems.length - 1) moveServiceItem(index, index + 1); }}
                  className="p-0.5 rounded hover:bg-secondary"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeServiceItem(item.id); }}
                  className="p-0.5 rounded hover:bg-destructive/20"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
