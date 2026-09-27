import React, { useState } from "react";
import { Flame, Loader2, Mail } from "lucide-react";
import { supabase } from "./lib/supabaseClient";

const TOKENS = {
  ink: "#22301C", inkSoft: "#54604B", paper: "#F2F0E2", paperRaised: "#FBFAF3",
  line: "#DAD6C2", herb: "#3F5D3A", herbDeep: "#2B4227", saffron: "#D9A441", clay: "#B5533C",
};

export default function Auth() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh", background: TOKENS.paper, color: TOKENS.ink,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        fontFamily: "'Work Sans', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: TOKENS.herb, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={20} color={TOKENS.saffron} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TOKENS.herbDeep }}>YourBite</div>
        </div>

        <div
          style={{
            background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`,
            borderRadius: 16, padding: 24,
          }}
        >
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <Mail size={28} color={TOKENS.herbDeep} style={{ marginBottom: 10 }} />
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Check your inbox</div>
              <div style={{ fontSize: 13.5, color: TOKENS.inkSoft, lineHeight: 1.5 }}>
                We sent a sign-in link to <strong>{email}</strong>. Open it on this device to continue.
              </div>
              <button
                onClick={() => setSent(false)}
                style={{
                  marginTop: 16, background: "none", border: "none", color: TOKENS.herbDeep,
                  fontSize: 13, cursor: "pointer", textDecoration: "underline",
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Sign in</div>
              <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 16 }}>
                Enter your email and we'll send you a sign-in link — no password needed.
              </div>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "11px 13px", borderRadius: 10,
                  border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 12,
                  background: "#fff", color: TOKENS.ink, boxSizing: "border-box",
                }}
              />
              {error && (
                <div style={{ fontSize: 12.5, color: TOKENS.clay, marginBottom: 12 }}>{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "11px 13px", borderRadius: 10, border: "none",
                  background: TOKENS.herb, color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading && <Loader2 size={15} className="spin" />}
                Send sign-in link
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
