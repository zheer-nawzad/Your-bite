import React, { useState } from "react";
import { Flame, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "./lib/supabaseClient";

const TOKENS = {
  ink: "#22301C", inkSoft: "#54604B", paper: "#F2F0E2", paperRaised: "#FBFAF3",
  line: "#DAD6C2", herb: "#3F5D3A", herbDeep: "#2B4227", saffron: "#D9A441", clay: "#B5533C",
};

const inputStyle = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 12,
  background: "#fff", color: TOKENS.ink, boxSizing: "border-box",
};
const buttonStyle = (loading) => ({
  width: "100%", padding: "11px 13px", borderRadius: 10, border: "none",
  background: TOKENS.herb, color: "#fff", fontSize: 14, fontWeight: 600,
  cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
});

export default function Auth() {
  const [mode, setMode] = useState("login"); // login | signup | verify
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) setError(error.message);
    else setMode("verify");
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "signup" });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function handleResend() {
    setLoading(true); setError(""); setResent(false);
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
    setLoading(false);
    if (error) setError(error.message);
    else setResent(true);
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

        <div style={{ background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 16, padding: 24 }}>
          {mode === "verify" ? (
            <form onSubmit={handleVerify}>
              <ShieldCheck size={26} color={TOKENS.herbDeep} style={{ marginBottom: 10 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Enter verification code</div>
              <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 16, lineHeight: 1.5 }}>
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account.
              </div>
              <input
                type="text" inputMode="numeric" required autoFocus
                placeholder="123456" value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ ...inputStyle, textAlign: "center", letterSpacing: 4, fontSize: 18 }}
              />
              {error && <div style={{ fontSize: 12.5, color: TOKENS.clay, marginBottom: 12 }}>{error}</div>}
              {resent && <div style={{ fontSize: 12.5, color: TOKENS.herbDeep, marginBottom: 12 }}>New code sent.</div>}
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading && <Loader2 size={15} className="spin" />}
                Verify & continue
              </button>
              <button
                type="button" onClick={handleResend} disabled={loading}
                style={{ marginTop: 12, width: "100%", background: "none", border: "none", color: TOKENS.herbDeep, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
              >
                Resend code
              </button>
            </form>
          ) : (
            <form onSubmit={mode === "signup" ? handleSignup : handleLogin}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{mode === "signup" ? "Create your account" : "Sign in"}</div>
              <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 16 }}>
                {mode === "signup" ? "We'll email you a code to verify it's you." : "Enter your email and password."}
              </div>
              <input
                type="email" required placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} style={inputStyle}
              />
              <input
                type="password" required placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle}
              />
              {mode === "signup" && (
                <input
                  type="password" required placeholder="Confirm password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle}
                />
              )}
              {error && <div style={{ fontSize: 12.5, color: TOKENS.clay, marginBottom: 12 }}>{error}</div>}
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading && <Loader2 size={15} className="spin" />}
                {mode === "signup" ? "Sign up" : "Log in"}
              </button>
              <button
                type="button"
                onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
                style={{ marginTop: 12, width: "100%", background: "none", border: "none", color: TOKENS.herbDeep, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
              >
                {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        html, body { margin: 0; padding: 0; width: 100%; overflow-x: hidden; }
        input, select, textarea { font-size: 16px !important; }
      `}</style>
    </div>
  );
}
