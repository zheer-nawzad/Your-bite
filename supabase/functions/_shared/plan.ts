// Plan rules shared by ai-proxy and billing. Change prices/limits here only.
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

export const FREE_LIMITS: Record<string, number> = { scan: 2, upload: 2 };
export const PAID_PHOTO_CAP = 150;   // anti-abuse ceiling per day for paid users
export const TEXT_DAILY_CAP = 300;   // anti-abuse ceiling per day for everyone
export const TRIAL_DAYS = 14;
export const PRICES: Record<string, number> = { pro: 5000, pro_plus: 10000 }; // IQD per 30 days
export const PLAN_DAYS = 30;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

// Quotas reset at midnight Kurdistan/Baghdad time (UTC+3, no DST).
const BAGHDAD_OFFSET_MS = 3 * 60 * 60 * 1000;
export function baghdadDay(now = Date.now()): string {
  return new Date(now + BAGHDAD_OFFSET_MS).toISOString().slice(0, 10);
}
export function nextResetISO(now = Date.now()): string {
  const local = new Date(now + BAGHDAD_OFFSET_MS);
  const nextLocalMidnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 1);
  return new Date(nextLocalMidnight - BAGHDAD_OFFSET_MS).toISOString();
}

export async function getUser(req: Request, admin: SupabaseClient) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export type PlanRow = { tier: string; paid_until: string | null; training_trial_start: string | null };

export async function getPlan(admin: SupabaseClient, userId: string) {
  const { data } = await admin.from("user_plans").select("tier, paid_until, training_trial_start").eq("user_id", userId).maybeSingle();
  const row = (data || { tier: "free", paid_until: null, training_trial_start: null }) as PlanRow;
  const active = row.tier !== "free" && !!row.paid_until && new Date(row.paid_until).getTime() > Date.now();
  const tier = active ? row.tier : "free";
  const trialStart = row.training_trial_start;
  const trialEnds = trialStart ? new Date(new Date(trialStart).getTime() + TRIAL_DAYS * 86400000).toISOString() : null;
  const trainingAllowed = tier === "pro_plus" || !trialEnds || new Date(trialEnds).getTime() > Date.now();
  return { tier, paidUntil: active ? row.paid_until : null, trialStart, trialEnds, trainingAllowed };
}

export function isAdminEmail(email?: string | null) {
  const list = (Deno.env.get("ADMIN_EMAILS") || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}
