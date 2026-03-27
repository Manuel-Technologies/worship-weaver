import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BibleReference } from "@/lib/bible-data";

interface AIDetectedRef {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  confidence: number;
  reason: string;
}

interface UseAIScriptureDetectionOptions {
  enabled: boolean;
  onDetected: (ref: BibleReference, reason: string) => void;
  debounceMs?: number;
}

export function useAIScriptureDetection({ enabled, onDetected, debounceMs = 400 }: UseAIScriptureDetectionOptions) {
  const bufferRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessedRef = useRef<string>("");
  const processingRef = useRef(false);

  const processBuffer = useCallback(async () => {
    if (processingRef.current || !enabled) return;
    
    const text = bufferRef.current.join(" ").trim();
    // Take last 20 words for context
    const words = text.split(/\s+/).slice(-20).join(" ");
    
    if (!words || words === lastProcessedRef.current || words.split(/\s+/).length < 3) return;
    
    processingRef.current = true;
    lastProcessedRef.current = words;

    try {
      const { data, error } = await supabase.functions.invoke("detect-scripture", {
        body: { transcript: words },
      });

      if (error) {
        console.error("AI scripture detection error:", error);
        return;
      }

      const refs: AIDetectedRef[] = data?.references || [];
      for (const ref of refs) {
        onDetected(
          {
            book: ref.book,
            chapter: ref.chapter,
            verseStart: ref.verseStart,
            verseEnd: ref.verseEnd,
          },
          ref.reason || "AI detected"
        );
      }
    } catch (err) {
      console.error("AI detection failed:", err);
    } finally {
      processingRef.current = false;
    }
  }, [enabled, onDetected]);

  const addTranscript = useCallback((text: string) => {
    if (!enabled) return;
    bufferRef.current.push(text);
    // Keep buffer manageable
    if (bufferRef.current.length > 10) {
      bufferRef.current = bufferRef.current.slice(-5);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(processBuffer, debounceMs);
  }, [enabled, processBuffer, debounceMs]);

  return { addTranscript };
}
