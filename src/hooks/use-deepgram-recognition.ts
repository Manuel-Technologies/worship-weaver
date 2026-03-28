import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DeepgramRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  provider: "deepgram" | "browser" | "none";
}

export function useDeepgramRecognition(
  onTranscript?: (text: string) => void
): DeepgramRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [provider, setProvider] = useState<"deepgram" | "browser" | "none">("none");

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  const browserSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const stopListening = useCallback(() => {
    // Stop Deepgram WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: "CloseStream" }));
      } catch { /* ignore */ }
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    // Stop browser fallback
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.stop();
    }

    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startDeepgram = useCallback(async () => {
    try {
      // Get API key from edge function
      const { data, error } = await supabase.functions.invoke("deepgram-token");
      if (error || !data?.key) throw new Error("Failed to get Deepgram token");

      const apiKey = data.key;

      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // Connect to Deepgram WebSocket
      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?` +
          `model=nova-2&` +
          `language=en&` +
          `smart_format=true&` +
          `punctuate=true&` +
          `interim_results=true&` +
          `endpointing=200&` +
          `utterance_end_ms=1500&` +
          `encoding=linear16&` +
          `sample_rate=16000&` +
          `channels=1`,
        ["token", apiKey]
      );

      wsRef.current = ws;

      ws.onopen = () => {
        setIsListening(true);
        setProvider("deepgram");

        // Set up audio processing
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32 to Int16
          const int16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          ws.send(int16.buffer);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "Results" && msg.channel?.alternatives?.[0]) {
          const alt = msg.channel.alternatives[0];
          const text = alt.transcript || "";
          if (!text) return;

          if (msg.is_final) {
            setTranscript((prev) => {
              const updated = prev + text + " ";
              onTranscript?.(text);
              return updated;
            });
            setInterimTranscript("");
          } else {
            setInterimTranscript(text);
          }
        }
      };

      ws.onerror = (e) => {
        console.error("Deepgram WebSocket error:", e);
        stopListening();
      };

      ws.onclose = () => {
        // Clean up if not already stopped
        if (wsRef.current === ws) {
          stopListening();
        }
      };
    } catch (err) {
      console.warn("Deepgram failed, falling back to browser:", err);
      startBrowserFallback();
    }
  }, [onTranscript, stopListening]);

  const startBrowserFallback = useCallback(() => {
    if (!browserSupported) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setTranscript((prev) => {
          const updated = prev + final;
          onTranscript?.(final.trim());
          return updated;
        });
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") setIsListening(false);
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch { setIsListening(false); }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setProvider("browser");
  }, [browserSupported, onTranscript]);

  const startListening = useCallback(() => {
    startDeepgram();
  }, [startDeepgram]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported: true, // Deepgram works in all browsers
    provider,
  };
}
