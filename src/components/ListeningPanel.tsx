import { useState, useCallback, useEffect } from "react";
import { Mic, MicOff, Volume2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { detectReferencesInText, getVersesByReference, loadBible, type BibleReference } from "@/lib/bible-data";
import { useProjection } from "@/contexts/ProjectionContext";

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
  const [detectedRefs, setDetectedRefs] = useState<{ ref: BibleReference; text: string; time: Date }[]>([]);
  const [commandLog, setCommandLog] = useState<{ cmd: string; time: Date }[]>([]);
  const [bibleReady, setBibleReady] = useState(false);
  const { goLiveScripture, nextVerse, prevVerse, goBlack } = useProjection();

  useEffect(() => {
    loadBible().then(() => setBibleReady(true));
  }, []);

  const handleTranscript = useCallback((text: string) => {
    if (!bibleReady) return;

    const cmd = detectVoiceCommand(text);
    if (cmd) {
      setCommandLog((prev) => [...prev.slice(-4), { cmd, time: new Date() }]);
      switch (cmd) {
        case "NEXT_VERSE": nextVerse(); return;
        case "PREV_VERSE": prevVerse(); return;
        case "BLACK": goBlack(); return;
      }
    }

    const refs = detectReferencesInText(text);
    if (refs.length === 0) return;

    for (const ref of refs) {
      const verses = getVersesByReference(ref);
      if (verses.length === 0) continue;
      setDetectedRefs((prev) => [...prev.slice(-9), { ref, text: verses[0].text.slice(0, 80), time: new Date() }]);
      goLiveScripture(ref);
    }
  }, [bibleReady, goLiveScripture, nextVerse, prevVerse, goBlack]);

  const { isListening, transcript, interimTranscript, startListening, stopListening, isSupported } = useSpeechRecognition(handleTranscript);

  if (!isSupported) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">
        <p>Speech recognition not supported.</p>
        <p className="mt-1">Use Chrome or Edge for auto-detection.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Auto-Scripture</span>
        </div>
        {isListening && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-success font-bold uppercase tracking-wider">Active Listening</span>
            </span>
          </div>
        )}
      </div>

      <div className="px-3 pt-2 pb-1">
        <p className="text-[11px] text-muted-foreground">Real-time intelligent transcription listener</p>
      </div>

      {/* Start/Stop Button */}
      <div className="px-3 py-2">
        {!isListening ? (
          <Button
            size="sm"
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10 rounded-lg"
            onClick={startListening}
          >
            <Mic className="w-4 h-4" /> Start Listening
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2 h-10 rounded-lg border-border"
            onClick={stopListening}
          >
            <MicOff className="w-4 h-4" /> Stop Listening
          </Button>
        )}
      </div>

      {/* Voice commands */}
      <div className="px-3 pb-2">
        <div className="text-[9px] text-muted-foreground bg-secondary rounded-lg px-3 py-2">
          <span className="font-bold text-foreground/60">Voice Commands:</span> "next verse", "go back", "clear screen"
        </div>
      </div>

      {/* Live transcript */}
      {(transcript || interimTranscript) && (
        <div className="px-3 pb-2">
          <div className="rounded-lg bg-secondary p-3 text-xs text-foreground/70 max-h-32 overflow-y-auto leading-relaxed">
            <span className="italic text-muted-foreground">"</span>
            {transcript.split(" ").slice(-30).join(" ")}
            {interimTranscript && (
              <span className="text-muted-foreground/60 italic"> {interimTranscript}</span>
            )}
            <span className="italic text-muted-foreground">"</span>
          </div>
        </div>
      )}

      {/* Command log */}
      {commandLog.length > 0 && (
        <div className="px-3 pb-2">
          {commandLog.slice().reverse().slice(0, 3).map((c, i) => (
            <div key={i} className="text-[10px] text-success flex items-center gap-1.5 py-0.5">
              <span className="text-success">✓</span>
              <span>{c.cmd.replace("_", " ")}</span>
              <span className="text-muted-foreground ml-auto text-[9px]">
                {c.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Detected references */}
      {detectedRefs.length > 0 && (
        <div className="px-3 pb-2 flex-1 overflow-y-auto">
          <div className="text-[9px] text-muted-foreground mb-2 uppercase font-bold tracking-wider">Detected References</div>
          {detectedRefs.slice().reverse().map((d, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 mb-2 cursor-pointer transition-all ${
                i === 0
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
              onClick={() => goLiveScripture(d.ref)}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className={`text-xs font-bold uppercase ${i === 0 ? "text-primary" : "text-foreground"}`}>
                  {d.ref.book} {d.ref.chapter}:{d.ref.verseStart}
                  {d.ref.verseEnd ? `-${d.ref.verseEnd}` : ""} DETECTED
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                "{d.text}..."
              </p>
              {i === 0 && (
                <div className="flex gap-2 mt-2 pl-5">
                  <Button size="sm" className="h-7 text-[10px] bg-primary text-primary-foreground px-4" onClick={() => goLiveScripture(d.ref)}>
                    PROJECT NOW
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isListening && detectedRefs.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground">Click "Start Listening" to detect</p>
            <p className="text-xs text-muted-foreground">Bible references automatically</p>
          </div>
        </div>
      )}
    </div>
  );
}
