// Proxies chat requests to the Anthropic API so the API key never reaches the browser.
// Deploy with: supabase functions deploy ai-proxy
// Set the secret with: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: { message: "ANTHROPIC_API_KEY is not configured" } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.text();
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: "invalid request body" } }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body,
  });

  const responseText = await anthropicResp.text();
  return new Response(responseText, {
    status: anthropicResp.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
