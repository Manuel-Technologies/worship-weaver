import { useState, useCallback, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { detectReferencesInText, getVersesByReference, getVerseDisplay, loadBible, type BibleReference } from "@/lib/bible-data";
import { useProjection } from "@/contexts/ProjectionContext";
import { SlideData } from "@/lib/service-types";

export function ListeningPanel() {
  const [detectedRefs, setDetectedRefs] = useState<{ ref: BibleReference; time: Date }[]>([]);
  const [bibleReady, setBibleReady] = useState(false);
  const { goLive } = useProjection();

  useEffect(() => {
    loadBible().then(() => setBibleReady(true));
  }, []);

  const handleTranscript = useCallback((text: string) => {
    if (!bibleReady) return;
    const refs = detectReferencesInText(text);
    if (refs.length === 0) return;

    for (const ref of refs) {
      const verses = getVersesByReference(ref);
      if (verses.length === 0) continue;

      setDetectedRefs((prev) => [...prev.slice(-9), { ref, time: new Date() }]);

      // Auto-project the first verse
      const slide: SlideData = {
        id: crypto.randomUUID(),
        title: "",
        reference: ref.verseEnd
          ? `${ref.book} ${ref.chapter}:${ref.verseStart}-${ref.verseEnd}`
          : `${ref.book} ${ref.chapter}:${ref.verseStart}`,
        bodyLines: verses.map((v) => `${v.verse}. ${v.text}`),
      };
      goLive(slide);
    }
  }, [bibleReady, goLive]);

  const { isListening, transcript, interimTranscript, startListening, stopListening, isSupported } = useSpeechRecognition(handleTranscript);

  if (!isSupported) {
    return (
      <div className="p-3 text-center text-xs text-muted-foreground">
        <p>Speech recognition not supported in this browser.</p>
        <p className="mt-1">Use Chrome or Edge for auto-detection.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="panel-header-title">Live Listener</span>
          {isListening && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
              <span className="text-[9px] text-live font-medium">LISTENING</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-2 flex gap-2">
        {!isListening ? (
          <Button size="sm" className="flex-1 gap-1.5 bg-live hover:bg-live/90" onClick={startListening}>
            <Mic className="w-3.5 h-3.5" /> Start Listening
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={stopListening}>
            <MicOff className="w-3.5 h-3.5" /> Stop
          </Button>
        )}
      </div>

      {/* Live transcript */}
      {(transcript || interimTranscript) && (
        <div className="px-2 pb-2">
          <div className="text-[9px] text-muted-foreground mb-1 uppercase font-semibold">Transcript</div>
          <div className="text-xs text-foreground/80 max-h-20 overflow-y-auto rounded bg-secondary p-2">
            {transcript.split(" ").slice(-30).join(" ")}
            {interimTranscript && (
              <span className="text-muted-foreground italic"> {interimTranscript}</span>
            )}
          </div>
        </div>
      )}

      {/* Detected references */}
      {detectedRefs.length > 0 && (
        <div className="px-2 pb-2 flex-1 overflow-y-auto">
          <div className="text-[9px] text-muted-foreground mb-1 uppercase font-semibold">Detected References</div>
          {detectedRefs.slice().reverse().map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs p-1.5 rounded bg-secondary mb-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                const verses = getVersesByReference(d.ref);
                if (verses.length === 0) return;
                const slide: SlideData = {
                  id: crypto.randomUUID(),
                  title: "",
                  reference: d.ref.verseEnd
                    ? `${d.ref.book} ${d.ref.chapter}:${d.ref.verseStart}-${d.ref.verseEnd}`
                    : `${d.ref.book} ${d.ref.chapter}:${d.ref.verseStart}`,
                  bodyLines: verses.map((v) => `${v.verse}. ${v.text}`),
                };
                goLive(slide);
              }}
            >
              <Volume2 className="w-3 h-3 text-primary shrink-0" />
              <span className="font-medium text-primary">
                {d.ref.book} {d.ref.chapter}:{d.ref.verseStart}
                {d.ref.verseEnd ? `-${d.ref.verseEnd}` : ""}
              </span>
              <span className="text-[9px] text-muted-foreground ml-auto">
                {d.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isListening && detectedRefs.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-3">
          <div className="text-center text-xs text-muted-foreground">
            <Mic className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p>Click "Start Listening" to detect</p>
            <p>Bible references from the pastor</p>
            <p className="mt-2 text-[9px]">Scriptures will auto-project to HDMI</p>
          </div>
        </div>
      )}
    </div>
  );
}
