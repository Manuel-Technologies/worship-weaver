import { useDisplaySettings, DisplaySettings } from "@/contexts/DisplaySettingsContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AlignLeft, AlignCenter, AlignRight, Image, X } from "lucide-react";
import { useRef } from "react";

const THEMES: { value: DisplaySettings["theme"]; label: string; color: string }[] = [
  { value: "dark", label: "Dark", color: "hsl(225, 20%, 6%)" },
  { value: "midnight", label: "Midnight", color: "hsl(230, 35%, 8%)" },
  { value: "warm", label: "Warm", color: "hsl(25, 30%, 10%)" },
  { value: "nature", label: "Nature", color: "hsl(150, 20%, 8%)" },
  { value: "royal", label: "Royal", color: "hsl(270, 30%, 10%)" },
];

export function DisplaySettingsPanel() {
  const { settings, updateSettings } = useDisplaySettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({ backgroundImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Theme */}
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Theme
        </Label>
        <div className="flex gap-1.5">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => updateSettings({ theme: t.value })}
              className={`w-8 h-8 rounded-md border-2 transition-all ${
                settings.theme === t.value
                  ? "border-primary shadow-md"
                  : "border-border hover:border-primary/40"
              }`}
              style={{ background: t.color }}
              title={t.label}
            />
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Font Size: {settings.fontSize}px
        </Label>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([v]) => updateSettings({ fontSize: v })}
          min={24}
          max={80}
          step={2}
          className="w-full"
        />
      </div>

      {/* Alignment */}
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Alignment
        </Label>
        <div className="flex gap-1">
          {([
            { value: "left" as const, icon: AlignLeft },
            { value: "center" as const, icon: AlignCenter },
            { value: "right" as const, icon: AlignRight },
          ]).map(({ value, icon: Icon }) => (
            <Button
              key={value}
              size="sm"
              variant={settings.fontAlign === value ? "default" : "outline"}
              className="h-7 w-9 p-0"
              onClick={() => updateSettings({ fontAlign: value })}
            >
              <Icon className="w-3.5 h-3.5" />
            </Button>
          ))}
        </div>
      </div>

      {/* Background Image */}
      <div>
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
          Background Image
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {settings.backgroundImage ? (
          <div className="relative">
            <img
              src={settings.backgroundImage}
              alt="Background"
              className="w-full h-16 object-cover rounded-md border border-border"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-1 right-1 h-5 w-5 p-0"
              onClick={() => updateSettings({ backgroundImage: null })}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-3.5 h-3.5" /> Choose Image
          </Button>
        )}
      </div>
    </div>
  );
}
