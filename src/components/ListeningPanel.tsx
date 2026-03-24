import { useState, useCallback, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { detectReferencesInText, getVersesByReference, loadBible, type BibleReference } from "@/lib/bible-data";
import { useProjection } from "@/contexts/ProjectionContext";
import { SlideData } from "@/lib/service-types";

const VOICE_COMMANDS: Record<string, string> = {
  "next verse": "NEXT_VERSE",
  "go to next verse": "NEXT_VERSE",
  "move to next verse": "NEXT_VERSE",
  "the next verse": "NEXT_VERSE",
  "read the next verse": "NEXT_VERSE",
  "continue": "NEXT_VERSE",
  "next": "NEXT_VERSE",
  "previous verse": "PREV_VERSE",
  "go back": "PREV_VERSE",
  "go to previous verse": "PREV_VERSE",
  "last verse": "PREV_VERSE",
  "back": "PREV_VERSE",
  "clear screen": "BLACK",
  "black out": "BLACK",
  "blank screen": "BLACK",
  "clear": "BLACK",
};

function detectVoiceCommand(text: string): string | null {
  const t = text.toLowerCase().trim();
  for (const [phrase, cmd] of Object.entries(VOICE_COMMANDS)) {
    if (t.includes(phrase)) return cmd;
  }
  return null;
}

export function ListeningPanel() {
  const [detectedRefs, setDetectedRefs] = useState<{ ref: BibleReference; time: Date }[]>([]);
  const [commandLog, setCommandLog] = useState<{ cmd: string; time: Date }[]>([]);
  const [bibleReady, setBibleReady] = useState(false);
  const { goLive, goLiveScripture, nextVerse, prevVerse, goBlack } = useProjection();

  useEffect(() => {
    loadBible().then(() => setBibleReady(true));
  }, []);

  const handleTranscript = useCallback((text: string) => {
    if (!bibleReady) return;

    // Check for voice commands first
    const cmd = detectVoiceCommand(text);
    if (cmd) {
      setCommandLog((prev) => [...prev.slice(-4), { cmd, time: new Date() }]);
      switch (cmd) {
        case "NEXT_VERSE":
          nextVerse();
          return;
        case "PREV_VERSE":
          prevVerse();
          return;
        case "BLACK":
          goBlack();
          return;
      }
    }

    // Then check for Bible references
    const refs = detectReferencesInText(text);
    if (refs.length === 0) return;

    for (const ref of refs) {
      const verses = getVersesByReference(ref);
      if (verses.length === 0) continue;

      setDetectedRefs((prev) => [...prev.slice(-9), { ref, time: new Date() }]);

      // Project the first verse and track scripture state
      goLiveScripture(ref);
    }
  }, [bibleReady, goLiveScripture, nextVerse, prevVerse, goBlack]);

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

      {/* Voice commands hint */}
      <div className="px-2 pb-1">
        <div className="text-[8px] text-muted-foreground bg-secondary rounded px-2 py-1">
          <span className="font-semibold">Voice:</span> "next verse", "previous verse", "go back", "clear screen"
        </div>
      </div>

      {/* Command log */}
      {commandLog.length > 0 && (
        <div className="px-2 pb-1">
          {commandLog.slice().reverse().slice(0, 3).map((c, i) => (
            <div key={i} className="text-[9px] text-success flex items-center gap-1">
              <span>✓ {c.cmd.replace("_", " ")}</span>
              <span className="text-muted-foreground ml-auto">
                {c.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}

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
              onClick={() => goLiveScripture(d.ref)}
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
            <p className="mt-2 text-[9px]">Say "next verse" to advance</p>
          </div>
        </div>
      )}
    </div>
  );
}
