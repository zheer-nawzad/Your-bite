import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./Auth.jsx";
import YourBite from "./YourBite.jsx";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <Loader2 className="spin" size={26} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    );
  }

  if (!session) return <Auth />;

  return <YourBite key={session.user.id} />;
}
