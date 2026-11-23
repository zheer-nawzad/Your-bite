import React, { useEffect, useState } from "react";
import { Flame, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "./lib/supabaseClient";

const TOKENS = {
  ink: "#22301C", inkSoft: "#54604B", paper: "#F2F0E2", paperRaised: "#FBFAF3",
  line: "#DAD6C2", herb: "#3F5D3A", herbDeep: "#2B4227", saffron: "#D9A441", clay: "#B5533C",
};

// The language picked here is remembered and becomes the app language for new accounts.
export const LANG_STORAGE_KEY = "yb_lang";
export function initialLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "en" || saved === "ar" || saved === "ckb") return saved;
  } catch (e) {}
  const nav = (typeof navigator !== "undefined" && (navigator.languages || [navigator.language]).join(",").toLowerCase()) || "";
  if (/\b(ckb|ku)/.test(nav)) return "ckb";
  if (/\bar/.test(nav)) return "ar";
  return "en";
}

const FONT = { en: "'Work Sans', sans-serif", ar: "'Noto Kufi Arabic', sans-serif", ckb: "'Noto Kufi Arabic', sans-serif" };

const T = {
  en: {
    dir: "ltr",
    signin: "Sign in", signin_sub: "Enter your email and password.",
    signup: "Create your account", signup_sub: "We'll email you a code to verify it's you.",
    google: "Continue with Google", or: "or",
    email_ph: "you@example.com", password_ph: "Password", confirm_ph: "Confirm password",
    login_btn: "Log in", signup_btn: "Sign up",
    to_signup: "New here? Create an account", to_login: "Already have an account? Log in", forgot: "Forgot password?",
    verify_title: "Enter verification code", verify_sub: "We sent a 6-digit code to {email}. Enter it below to activate your account.",
    verify_btn: "Verify & continue", resend: "Resend code", resent: "New code sent — check your inbox and spam folder.",
    forgot_title: "Reset your password", forgot_sub: "Enter your email and we'll send you a code to reset your password.",
    forgot_btn: "Send reset code", back: "Back to sign in",
    reset_title: "Enter code & new password", reset_sub: "We sent a 6-digit code to {email}. Enter it below along with your new password.",
    new_password_ph: "New password", confirm_new_ph: "Confirm new password", reset_btn: "Reset password",
    err_match: "Passwords don't match.", err_short: "Password must be at least 6 characters.",
    err_invalid: "Wrong email or password.", err_exists: "This email already has an account — log in instead.",
    err_unconfirmed: "Your email isn't verified yet. We sent you a new code.", err_code: "That code is wrong or expired. Tap “Resend code” for a new one.",
    err_wait: "Too many tries. Please wait a minute and try again.", err_network: "No connection. Check your internet and try again.",
    err_generic: "Something went wrong. Please try again.",
  },
  ar: {
    dir: "rtl",
    signin: "تسجيل الدخول", signin_sub: "أدخل بريدك الإلكتروني وكلمة المرور.",
    signup: "أنشئ حسابك", signup_sub: "سنرسل لك رمزًا عبر البريد للتأكد من هويتك.",
    google: "المتابعة باستخدام Google", or: "أو",
    email_ph: "you@example.com", password_ph: "كلمة المرور", confirm_ph: "تأكيد كلمة المرور",
    login_btn: "دخول", signup_btn: "إنشاء حساب",
    to_signup: "جديد هنا؟ أنشئ حسابًا", to_login: "لديك حساب؟ سجّل الدخول", forgot: "نسيت كلمة المرور؟",
    verify_title: "أدخل رمز التحقق", verify_sub: "أرسلنا رمزًا من 6 أرقام إلى {email}. أدخله أدناه لتفعيل حسابك.",
    verify_btn: "تحقق وتابع", resend: "إعادة إرسال الرمز", resent: "تم إرسال رمز جديد — تحقق من البريد والرسائل غير المرغوب فيها.",
    forgot_title: "إعادة تعيين كلمة المرور", forgot_sub: "أدخل بريدك وسنرسل لك رمزًا لإعادة تعيين كلمة المرور.",
    forgot_btn: "إرسال الرمز", back: "العودة لتسجيل الدخول",
    reset_title: "أدخل الرمز وكلمة المرور الجديدة", reset_sub: "أرسلنا رمزًا من 6 أرقام إلى {email}. أدخله مع كلمة المرور الجديدة.",
    new_password_ph: "كلمة المرور الجديدة", confirm_new_ph: "تأكيد كلمة المرور الجديدة", reset_btn: "إعادة التعيين",
    err_match: "كلمتا المرور غير متطابقتين.", err_short: "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
    err_invalid: "البريد أو كلمة المرور غير صحيحة.", err_exists: "هذا البريد لديه حساب بالفعل — سجّل الدخول بدلًا من ذلك.",
    err_unconfirmed: "لم يتم التحقق من بريدك بعد. أرسلنا لك رمزًا جديدًا.", err_code: "الرمز غير صحيح أو منتهي. اضغط «إعادة إرسال الرمز».",
    err_wait: "محاولات كثيرة. انتظر دقيقة ثم حاول مجددًا.", err_network: "لا يوجد اتصال. تحقق من الإنترنت وحاول مجددًا.",
    err_generic: "حدث خطأ. حاول مرة أخرى.",
  },
  ckb: {
    dir: "rtl",
    signin: "چوونەژوورەوە", signin_sub: "ئیمەیڵ و وشەی نهێنییەکەت بنووسە.",
    signup: "هەژمارەکەت دروست بکە", signup_sub: "کۆدێکت بۆ ئیمەیڵەکەت دەنێرین بۆ دڵنیابوونەوە.",
    google: "بەردەوامبوون بە Google", or: "یان",
    email_ph: "you@example.com", password_ph: "وشەی نهێنی", confirm_ph: "دووبارەکردنەوەی وشەی نهێنی",
    login_btn: "چوونەژوورەوە", signup_btn: "خۆتۆمارکردن",
    to_signup: "نوێیت؟ هەژمارێک دروست بکە", to_login: "هەژمارت هەیە؟ بچۆ ژوورەوە", forgot: "وشەی نهێنیت لەبیرچووە؟",
    verify_title: "کۆدی پشتڕاستکردنەوە بنووسە", verify_sub: "کۆدێکی 6 ژمارەییمان بۆ {email} نارد. لێرە بینووسە بۆ چالاککردنی هەژمارەکەت.",
    verify_btn: "پشتڕاستکردنەوە و بەردەوامبوون", resend: "ناردنەوەی کۆد", resent: "کۆدێکی نوێ نێردرا — ئیمەیڵ و بەشی سپام بپشکنە.",
    forgot_title: "گۆڕینی وشەی نهێنی", forgot_sub: "ئیمەیڵەکەت بنووسە و کۆدێکت بۆ دەنێرین بۆ گۆڕینی وشەی نهێنی.",
    forgot_btn: "ناردنی کۆد", back: "گەڕانەوە بۆ چوونەژوورەوە",
    reset_title: "کۆد و وشەی نهێنیی نوێ بنووسە", reset_sub: "کۆدێکی 6 ژمارەییمان بۆ {email} نارد. لەگەڵ وشەی نهێنیی نوێدا بینووسە.",
    new_password_ph: "وشەی نهێنیی نوێ", confirm_new_ph: "دووبارەکردنەوەی وشەی نهێنیی نوێ", reset_btn: "گۆڕینی وشەی نهێنی",
    err_match: "وشە نهێنییەکان وەک یەک نین.", err_short: "وشەی نهێنی دەبێت لانیکەم 6 پیت بێت.",
    err_invalid: "ئیمەیڵ یان وشەی نهێنی هەڵەیە.", err_exists: "ئەم ئیمەیڵە پێشتر هەژماری هەیە — لە جیاتی ئەوە بچۆ ژوورەوە.",
    err_unconfirmed: "ئیمەیڵەکەت هێشتا پشتڕاست نەکراوەتەوە. کۆدێکی نوێمان بۆ ناردیت.", err_code: "کۆدەکە هەڵەیە یان بەسەرچووە. «ناردنەوەی کۆد» دابگرە.",
    err_wait: "هەوڵی زۆر. خولەکێک چاوەڕێ بکە و دووبارە هەوڵ بدەوە.", err_network: "پەیوەندی نییە. ئینتەرنێتەکەت بپشکنە و دووبارە هەوڵ بدەوە.",
    err_generic: "هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵ بدەوە.",
  },
};

// Supabase errors are English technical text — turn them into a friendly message.
function friendlyError(t, error) {
  const m = String((error && error.message) || error || "").toLowerCase();
  if (m.includes("invalid login credentials")) return t.err_invalid;
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already exists")) return t.err_exists;
  if (m.includes("email not confirmed")) return t.err_unconfirmed;
  if (m.includes("token has expired") || m.includes("invalid token") || m.includes("otp") || m.includes("expired")) return t.err_code;
  if (m.includes("security purposes") || m.includes("rate limit") || m.includes("too many")) return t.err_wait;
  if (m.includes("failed to fetch") || m.includes("network")) return t.err_network;
  if (m.includes("password should be at least")) return t.err_short;
  return t.err_generic;
}

const inputStyle = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 12,
  background: "#fff", color: TOKENS.ink, boxSizing: "border-box", fontFamily: "inherit",
};
const buttonStyle = (loading) => ({
  width: "100%", padding: "11px 13px", borderRadius: 10, border: "none",
  background: TOKENS.herb, color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
  cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
});
const linkStyle = {
  marginTop: 12, width: "100%", background: "none", border: "none", color: TOKENS.herbDeep,
  fontSize: 13, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit",
};

export default function Auth() {
  const [lang, setLang] = useState(initialLang);
  const t = T[lang];
  const [mode, setMode] = useState("login"); // login | signup | verify | forgot | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (document.getElementById("nutripath-fonts")) return;
    const link = document.createElement("link");
    link.id = "nutripath-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Work+Sans:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  function pickLang(l) {
    setLang(l);
    try { localStorage.setItem(LANG_STORAGE_KEY, l); } catch (e) {}
  }
  function go(next) { setMode(next); setError(""); setResent(false); }
  const fill = (s) => s.split("{email}").join(email.trim());

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error && String(error.message).toLowerCase().includes("email not confirmed")) {
      // Signed up but never entered the code: send a fresh one and go straight to the code screen.
      await supabase.auth.resend({ type: "signup", email: email.trim() });
      setLoading(false); setCode(""); setMode("verify"); setResent(false); setError(t.err_unconfirmed);
      return;
    }
    setLoading(false);
    if (error) setError(friendlyError(t, error));
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (password !== confirmPassword) { setError(t.err_match); return; }
    if (password.length < 6) { setError(t.err_short); return; }
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) { setError(friendlyError(t, error)); return; }
    // Supabase answers "ok" for an email that already has an account, but with no identities.
    if (data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError(t.err_exists); setMode("login"); return;
    }
    setCode(""); setMode("verify");
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "signup" });
    setLoading(false);
    if (error) setError(friendlyError(t, error));
  }

  async function handleResend() {
    setLoading(true); setError(""); setResent(false);
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
    setLoading(false);
    if (error) setError(friendlyError(t, error));
    else setResent(true);
  }

  async function handleGoogle() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(friendlyError(t, error));
  }

  async function handleForgotSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) setError(friendlyError(t, error));
    else { setCode(""); setPassword(""); setConfirmPassword(""); go("reset"); }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) { setError(t.err_match); return; }
    if (password.length < 6) { setError(t.err_short); return; }
    setLoading(true); setError("");
    const { error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "recovery" });
    if (verifyError) { setLoading(false); setError(friendlyError(t, verifyError)); return; }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) setError(friendlyError(t, updateError));
  }

  async function handleResendReset() {
    setLoading(true); setError(""); setResent(false);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) setError(friendlyError(t, error));
    else setResent(true);
  }

  const codeInput = (
    <input
      type="text" inputMode="numeric" autoComplete="one-time-code" required autoFocus dir="ltr"
      placeholder="123456" value={code} maxLength={8}
      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
      style={{ ...inputStyle, textAlign: "center", letterSpacing: 4, fontSize: 18 }}
    />
  );
  const errorBox = error && <div style={{ fontSize: 12.5, color: TOKENS.clay, marginBottom: 12, lineHeight: 1.45 }}>{error}</div>;
  const resentBox = resent && <div style={{ fontSize: 12.5, color: TOKENS.herbDeep, marginBottom: 12, lineHeight: 1.45 }}>{t.resent}</div>;

  return (
    <div
      dir={t.dir}
      style={{
        minHeight: "100vh", background: TOKENS.paper, color: TOKENS.ink,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        fontFamily: FONT[lang],
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 18 }}>
          {[["en", "English"], ["ar", "العربية"], ["ckb", "کوردی"]].map(([code2, label]) => (
            <button
              key={code2} type="button" onClick={() => pickLang(code2)}
              style={{
                padding: "5px 12px", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                fontFamily: FONT[code2],
                border: `1.5px solid ${lang === code2 ? TOKENS.herb : TOKENS.line}`,
                background: lang === code2 ? TOKENS.herb : TOKENS.paperRaised,
                color: lang === code2 ? "#fff" : TOKENS.inkSoft,
              }}
            >{label}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: TOKENS.herb, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={20} color={TOKENS.saffron} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TOKENS.herbDeep, fontFamily: "'Work Sans', sans-serif" }}>YourBite</div>
        </div>

        <div style={{ background: TOKENS.paperRaised, border: `1px solid ${TOKENS.line}`, borderRadius: 16, padding: 24 }}>
          {mode === "verify" ? (
            <form onSubmit={handleVerify}>
              <ShieldCheck size={26} color={TOKENS.herbDeep} style={{ marginBottom: 10 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.verify_title}</div>
              <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 16, lineHeight: 1.6 }}>{fill(t.verify_sub)}</div>
              {codeInput}
              {errorBox}
              {resentBox}
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading && <Loader2 size={15} className="spin" />}
                {t.verify_btn}
              </button>
              <button type="button" onClick={handleResend} disabled={loading} style={linkStyle}>{t.resend}</button>
              <button type="button" onClick={() => go("login")} style={{ ...linkStyle, marginTop: 6, color: TOKENS.inkSoft, fontSize: 12.5 }}>{t.back}</button>
            </form>
          ) : mode === "forgot" ? (
            <form onSubmit={handleForgotSubmit}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.forgot_title}</div>
              <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 16, lineHeight: 1.6 }}>{t.forgot_sub}</div>
              <input
                type="email" required dir="ltr" autoComplete="email" placeholder={t.email_ph} value={email}
                onChange={(e) => setEmail(e.target.value)} style={inputStyle}
              />
              {errorBox}
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading && <Loader2 size={15} className="spin" />}
                {t.forgot_btn}
              </button>
              <button type="button" onClick={() => go("login")} style={linkStyle}>{t.back}</button>
            </form>
          ) : mode === "reset" ? (
            <form onSubmit={handleResetSubmit}>
              <ShieldCheck size={26} color={TOKENS.herbDeep} style={{ marginBottom: 10 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.reset_title}</div>
              <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 16, lineHeight: 1.6 }}>{fill(t.reset_sub)}</div>
              {codeInput}
              <input
                type="password" required autoComplete="new-password" placeholder={t.new_password_ph} value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle}
              />
              <input
                type="password" required autoComplete="new-password" placeholder={t.confirm_new_ph} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle}
              />
              {errorBox}
              {resentBox}
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading && <Loader2 size={15} className="spin" />}
                {t.reset_btn}
              </button>
              <button type="button" onClick={handleResendReset} disabled={loading} style={linkStyle}>{t.resend}</button>
            </form>
          ) : (
            <form onSubmit={mode === "signup" ? handleSignup : handleLogin}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{mode === "signup" ? t.signup : t.signin}</div>
              <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginBottom: 16 }}>
                {mode === "signup" ? t.signup_sub : t.signin_sub}
              </div>

              <button
                type="button" onClick={handleGoogle}
                style={{
                  width: "100%", padding: "10px 13px", borderRadius: 10, border: `1px solid ${TOKENS.line}`,
                  background: "#fff", color: TOKENS.ink, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16,
                }}
              >
                <svg width="17" height="17" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.2 0 19-7.4 19-19 0-1.3-.1-2.4-.4-4z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.5 29.2 4.5 24 4.5c-7.8 0-14.5 4.4-17.7 10.2z"/>
                  <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 34.8 26.7 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.4 39 16.1 43.5 24 43.5z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.4 36.5 43.5 30.9 43.5 24c0-1.3-.1-2.4-.4-3.5z"/>
                </svg>
                {t.google}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: TOKENS.line }} />
                <div style={{ fontSize: 12, color: TOKENS.inkSoft }}>{t.or}</div>
                <div style={{ flex: 1, height: 1, background: TOKENS.line }} />
              </div>

              <input
                type="email" required dir="ltr" autoComplete="email" placeholder={t.email_ph} value={email}
                onChange={(e) => setEmail(e.target.value)} style={inputStyle}
              />
              <input
                type="password" required autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder={t.password_ph} value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle}
              />
              {mode === "signup" && (
                <input
                  type="password" required autoComplete="new-password" placeholder={t.confirm_ph} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle}
                />
              )}
              {errorBox}
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading && <Loader2 size={15} className="spin" />}
                {mode === "signup" ? t.signup_btn : t.login_btn}
              </button>
              <button type="button" onClick={() => go(mode === "signup" ? "login" : "signup")} style={linkStyle}>
                {mode === "signup" ? t.to_login : t.to_signup}
              </button>
              {mode === "login" && (
                <button type="button" onClick={() => go("forgot")} style={{ ...linkStyle, marginTop: 8, color: TOKENS.inkSoft, fontSize: 12.5 }}>
                  {t.forgot}
                </button>
              )}
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
