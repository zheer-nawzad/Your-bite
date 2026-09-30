// Proxies requests to Google's Gemini API, translating between the same
// Claude-shaped request/response our client already uses (so client-side
// parsing code needs no changes) and Gemini's actual REST API.
// Deploy with: supabase functions deploy gemini-proxy
// Set the secret with: supabase secrets set GEMINI_API_KEY=...

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODEL = "gemini-3.8-flash";

function toGeminiParts(content) {
  if (typeof content === "string") return [{ text: content }];
  return content.map((block) => {
    if (block.type === "text") return { text: block.text };
    if (block.type === "image") {
      return { inlineData: { mimeType: block.source.media_type, data: block.source.data } };
    }
    return { text: "" };
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: { message: "GEMINI_API_KEY is not configured" } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: "invalid request body" } }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const contents = (body.messages || []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: toGeminiParts(m.content),
  }));

  const geminiBody = {
    contents,
    generationConfig: {
      maxOutputTokens: body.max_tokens || 2000,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
  if (body.system) {
    geminiBody.systemInstruction = { parts: [{ text: body.system }] };
  }

  let geminiResp;
  try {
    geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: `network: ${e.message || e}` } }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const geminiData = await geminiResp.json();

  if (!geminiResp.ok) {
    const msg = (geminiData && geminiData.error && geminiData.error.message) || "Gemini API error";
    return new Response(JSON.stringify({ error: { message: msg } }), {
      status: geminiResp.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const candidate = (geminiData.candidates || [])[0];
  const text = ((candidate && candidate.content && candidate.content.parts) || [])
    .map((p) => p.text || "")
    .join("\n");

  // Shaped like an Anthropic Messages API response so the client's existing
  // parsing (data.content.filter(b => b.type === "text")...) works unchanged.
  const anthropicShaped = {
    content: [{ type: "text", text }],
    stop_reason: (candidate && candidate.finishReason) || "end_turn",
  };

  return new Response(JSON.stringify(anthropicShaped), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
