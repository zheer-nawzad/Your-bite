// Plans and FIB payments.
// Deploy with: supabase functions deploy billing --no-verify-jwt
//   (--no-verify-jwt lets FIB call the payment callback; every other action checks the user itself)
// Secrets (Supabase Dashboard → Edge Functions → Secrets):
//   FIB_CLIENT_ID, FIB_CLIENT_SECRET   from FIB's Payment Gateway (business account)
//   FIB_BASE_URL                       optional, default https://fib.prod.fib.iq
//   ADMIN_EMAILS                       comma-separated emails allowed to activate plans by hand
import {
  adminClient, baghdadDay, corsHeaders, FREE_LIMITS, getPlan, getUser, isAdminEmail, json, nextResetISO,
  PLAN_DAYS, PRICES, TRIAL_DAYS,
} from "../_shared/plan.ts";

const FIB_BASE = (Deno.env.get("FIB_BASE_URL") || "https://fib.prod.fib.iq").replace(/\/+$/, "");
const fibReady = () => !!(Deno.env.get("FIB_CLIENT_ID") && Deno.env.get("FIB_CLIENT_SECRET"));

async function fibToken(): Promise<string> {
  const basic = btoa(`${Deno.env.get("FIB_CLIENT_ID")}:${Deno.env.get("FIB_CLIENT_SECRET")}`);
  const r = await fetch(`${FIB_BASE}/auth/realms/fib-online-shop/protocol/openid-connect/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.access_token) throw new Error(`FIB auth failed (${r.status})`);
  return data.access_token;
}

async function fib(method: string, path: string, body?: unknown) {
  const token = await fibToken();
  const r = await fetch(`${FIB_BASE}/protected/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!r.ok) throw new Error(`FIB ${path} failed (${r.status}): ${text.slice(0, 200)}`);
  return data;
}

// Asks FIB for the real status (never trusts the caller) and applies the plan once paid.
async function syncPayment(admin: ReturnType<typeof adminClient>, paymentId: string) {
  const st = await fib("GET", `/payments/${encodeURIComponent(paymentId)}/status`);
  const status = String(st?.status || "UNKNOWN");
  if (status === "PAID") await admin.rpc("apply_payment", { p_id: paymentId });
  else await admin.from("payments").update({ status }).eq("id", paymentId).eq("applied", false);
  return status;
}

async function usageToday(admin: ReturnType<typeof adminClient>, userId: string) {
  const { data } = await admin.from("ai_usage").select("feature, count").eq("user_id", userId).eq("day", baghdadDay());
  const usage: Record<string, number> = { scan: 0, upload: 0 };
  (data || []).forEach((r: any) => { usage[r.feature] = r.count; });
  return usage;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const admin = adminClient();
  const url = new URL(req.url);
  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }
  const action = url.searchParams.get("action") || body.action;

  // FIB server → us. The body is only a hint; the status is re-checked with FIB.
  if (action === "callback") {
    const id = String(body.id || body.paymentId || "");
    if (!id || !fibReady()) return json({ ok: true });
    const { data: pay } = await admin.from("payments").select("id, applied").eq("id", id).maybeSingle();
    if (pay && !pay.applied) { try { await syncPayment(admin, id); } catch (e) { console.error(e); } }
    return json({ ok: true });
  }

  const user = await getUser(req, admin);
  if (!user) return json({ error: "auth" }, 401);

  try {
    if (action === "status") {
      if (body.startTrial) {
        const p0 = await getPlan(admin, user.id);
        if (!p0.trialStart && p0.tier !== "pro_plus") await admin.rpc("start_training_trial", { p_user: user.id });
      }
      const plan = await getPlan(admin, user.id);
      return json({
        ...plan,
        usage: await usageToday(admin, user.id),
        limits: FREE_LIMITS,
        trialDays: TRIAL_DAYS,
        resetAt: nextResetISO(),
        prices: PRICES,
        planDays: PLAN_DAYS,
        fibReady: fibReady(),
        isAdmin: isAdminEmail(user.email),
        email: user.email,
      });
    }

    if (action === "create_payment") {
      const tier = body.tier === "pro_plus" ? "pro_plus" : body.tier === "pro" ? "pro" : null;
      if (!tier) return json({ error: "bad_tier" }, 400);
      if (!fibReady()) return json({ error: "fib_not_configured" }, 503);
      const amount = PRICES[tier];
      const returnUrl = typeof body.returnUrl === "string" && /^https:\/\//.test(body.returnUrl) ? body.returnUrl : undefined;
      const created = await fib("POST", "/payments", {
        monetaryValue: { amount, currency: "IQD" },
        statusCallbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/billing?action=callback`,
        description: `YourBite ${tier === "pro_plus" ? "Pro+" : "Pro"} - ${PLAN_DAYS} days`,
        ...(returnUrl ? { redirectUri: returnUrl } : {}),
        refundableFor: "P7D",
      });
      await admin.from("payments").insert({
        id: created.paymentId, user_id: user.id, tier, amount, days: PLAN_DAYS, method: "fib", status: "UNPAID",
      });
      return json({
        paymentId: created.paymentId,
        readableCode: created.readableCode,
        qrCode: created.qrCode,
        personalAppLink: created.personalAppLink,
        validUntil: created.validUntil,
        amount,
        tier,
      });
    }

    if (action === "check_payment") {
      const id = String(body.paymentId || "");
      const { data: pay } = await admin.from("payments").select("id, user_id, applied, status").eq("id", id).maybeSingle();
      if (!pay || pay.user_id !== user.id) return json({ error: "not_found" }, 404);
      const status = pay.applied ? "PAID" : await syncPayment(admin, id);
      return json({ status, plan: await getPlan(admin, user.id) });
    }

    if (action === "admin_activate") {
      if (!isAdminEmail(user.email)) return json({ error: "forbidden" }, 403);
      const tier = ["free", "pro", "pro_plus"].includes(body.tier) ? body.tier : null;
      const days = Math.max(1, Math.min(3650, Math.round(Number(body.days) || PLAN_DAYS)));
      if (!tier) return json({ error: "bad_tier" }, 400);
      const { data: targetId } = await admin.rpc("user_id_by_email", { p_email: String(body.email || "") });
      if (!targetId) return json({ error: "user_not_found" }, 404);
      const id = `manual-${crypto.randomUUID()}`;
      const { error } = await admin.from("payments").insert({
        id, user_id: targetId, tier, amount: tier === "free" ? 0 : PRICES[tier], days, method: "manual", status: "PAID",
      });
      if (error) throw error;
      await admin.rpc("apply_payment", { p_id: id });
      return json({ ok: true, plan: await getPlan(admin, targetId as string) });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "server", message: String((e as Error).message || e) }, 500);
  }
});
