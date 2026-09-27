import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./Auth.jsx";
import YourBite from "./YourBite.jsx";
import Splash from "./Splash.jsx";

const MIN_SPLASH_MS = 3000;
const FADE_MS = 400;

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [splashMounted, setSplashMounted] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    const timer = setTimeout(() => setMinTimeDone(true), MIN_SPLASH_MS);
    return () => { listener.subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  const ready = session !== undefined && minTimeDone;

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setSplashMounted(false), FADE_MS);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <>
      {session !== undefined && (session ? <YourBite key={session.user.id} /> : <Auth />)}
      {splashMounted && <Splash fadingOut={ready} />}
    </>
  );
}
