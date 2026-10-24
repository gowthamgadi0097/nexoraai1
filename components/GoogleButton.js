"use client";
import { useEffect, useRef, useState } from "react";

const ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleButton({ onSuccess, onError }) {
  const box = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ID) return;
    const init = () => {
      window.google.accounts.id.initialize({
        client_id: ID,
        callback: async ({ credential }) => {
          try {
            const r = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential }),
            });
            const d = await r.json();
            if (!r.ok) return onError(d.error || "Google sign-in failed.");
            onSuccess();
          } catch { onError("Network error. Try again."); }
        },
      });
      window.google.accounts.id.renderButton(box.current, { theme: "filled_black", size: "large", width: 340, text: "continue_with" });
      setReady(true);
    };
    if (window.google?.accounts?.id) return init();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = init;
    s.onerror = () => onError("Could not load Google sign-in.");
    document.head.appendChild(s);
  }, []); // eslint-disable-line

  if (!ID) return <p className="gnote">Google login needs NEXT_PUBLIC_GOOGLE_CLIENT_ID (see README).</p>;
  return (
    <>
      <div className="or"><span>or</span></div>
      <div ref={box} className="gbtn" />
      {!ready && <p className="gnote">Loading Google…</p>}
    </>
  );
}
