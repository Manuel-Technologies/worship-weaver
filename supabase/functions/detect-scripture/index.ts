import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    if (!transcript || typeof transcript !== "string" || transcript.trim().length < 3) {
      return new Response(JSON.stringify({ references: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a Bible scripture detection assistant for a church projection system. Analyze the pastor's speech transcript and identify any Bible references — explicit (e.g. "John 3:16"), quoted verses (e.g. "For God so loved the world"), paraphrased references (e.g. "the armor of God passage"), or contextual mentions (e.g. "that verse in Romans about faith"). Use the King James Version (KJV) as your reference. Only return references you are confident about. If none found, return nothing.`,
          },
          {
            role: "user",
            content: `Detect Bible references in this speech transcript: "${transcript}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_scripture_references",
              description: "Report detected Bible scripture references from the transcript",
              parameters: {
                type: "object",
                properties: {
                  references: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        book: { type: "string", description: "Bible book name (e.g. 'Genesis', '1 Kings', 'Psalm')" },
                        chapter: { type: "integer", description: "Chapter number" },
                        verseStart: { type: "integer", description: "Starting verse number" },
                        verseEnd: { type: "integer", description: "Ending verse number (same as verseStart if single verse)" },
                        confidence: { type: "number", description: "Confidence score 0-1" },
                        reason: { type: "string", description: "Brief reason for detection (e.g. 'direct quote', 'explicit reference', 'paraphrase')" },
                      },
                      required: ["book", "chapter", "verseStart", "confidence"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["references"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_scripture_references" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Add credits in Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ references: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ references: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    // Filter to high-confidence results only
    const highConfidence = (parsed.references || []).filter(
      (r: any) => r.confidence >= 0.7
    );

    return new Response(JSON.stringify({ references: highConfidence }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-scripture error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", references: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
