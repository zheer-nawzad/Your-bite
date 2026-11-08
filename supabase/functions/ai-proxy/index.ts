// Proxies AI requests to the Anthropic API so the API key never reaches the browser,
// and enforces the Free / Pro / Pro+ limits on the server.
// Deploy with: supabase functions deploy ai-proxy
// Secret:      supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
import {
  adminClient, baghdadDay, corsHeaders, FREE_LIMITS, getPlan, getUser, json, nextResetISO,
  PAID_PHOTO_CAP, TEXT_DAILY_CAP,
} from "../_shared/plan.ts";

const TRAINING_FEATURES = new Set(["training", "chat"]);
const TEXT_MODEL = "claude-haiku-4-5-20251001";

function hasImage(body: any): boolean {
  return (body.messages || []).some((m: any) =>
    Array.isArray(m.content) && m.content.some((c: any) => c && c.type === "image"));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: { message: "ANTHROPIC_API_KEY is not configured" } }, 500);

  const admin = adminClient();
  const user = await getUser(req, admin);
  if (!user) return json({ error: { type: "auth", message: "Please sign in again." } }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: { message: "invalid request body" } }, 400); }

  // Decide the feature on the server — a photo is always a photo, whatever the client says.
  const requested = String(new URL(req.url).searchParams.get("feature") || body.feature || "text");
  delete body.feature;
  let feature: string;
  if (hasImage(body)) feature = requested === "scan" ? "scan" : "upload";
  else if (TRAINING_FEATURES.has(requested)) feature = "training";
  else {
    feature = "text";
    // Free text logging stays cheap: small model, small answer.
    body.model = TEXT_MODEL;
    body.max_tokens = Math.min(Number(body.max_tokens) || 1000, 1200);
    delete body.output_config;
  }

  let counted: string | null = null;
  const day = baghdadDay();
  try {
    const plan = await getPlan(admin, user.id);
    if (feature === "scan" || feature === "upload") {
      const paid = plan.tier === "pro" || plan.tier === "pro_plus";
      const limit = paid ? PAID_PHOTO_CAP : FREE_LIMITS[feature];
      const { data: ok, error } = await admin.rpc("use_quota", { p_user: user.id, p_day: day, p_feature: feature, p_limit: limit });
      if (error) throw error;
      if (!ok) {
        return json({ error: { type: "quota_exceeded", feature, limit, resetAt: nextResetISO(), message: "Daily free limit reached." } }, 402);
      }
      counted = feature;
    } else if (feature === "training") {
      if (plan.tier !== "pro_plus") {
        if (!plan.trialStart) {
          await admin.rpc("start_training_trial", { p_user: user.id });
        } else if (!plan.trainingAllowed) {
          return json({ error: { type: "trial_ended", feature, message: "Free training trial ended." } }, 402);
        }
      }
    } else {
      const { data: ok, error } = await admin.rpc("use_quota", { p_user: user.id, p_day: day, p_feature: "text", p_limit: TEXT_DAILY_CAP });
      if (error) throw error;
      if (!ok) return json({ error: { type: "quota_exceeded", feature: "text", resetAt: nextResetISO(), message: "Daily limit reached." } }, 402);
      counted = "text";
    }
  } catch (e) {
    // If the plan tables are unavailable, don't take the whole app down.
    console.error("quota check failed", e);
  }

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(body),
  });
  const responseText = await anthropicResp.text();

  // Don't charge a free scan for a request that failed.
  if (!anthropicResp.ok && counted) {
    await admin.rpc("refund_quota", { p_user: user.id, p_day: day, p_feature: counted }).then(() => {}, () => {});
  }

  return new Response(responseText, {
    status: anthropicResp.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
