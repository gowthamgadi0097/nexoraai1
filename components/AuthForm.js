"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleButton from "./GoogleButton";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const signup = mode === "signup";
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function done() {
    const next = params.get("next");
    router.push(next && next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Something went wrong."); setBusy(false); return; }
      const next = params.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch {
      setErr("Network error. Try again."); setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="acard" onSubmit={submit}>
        <h1>{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="sub">{signup ? "Join NEXORA AI to explore all 17 car AI features." : "Log in to open the NEXORA AI feature demos."}</p>
        {signup && (
          <>
            <label>Full name</label>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required placeholder="Your name" />
          </>
        )}
        <label>Email</label>
        <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required minLength={6} placeholder="At least 6 characters" />
        {err && <div className="err">{err}</div>}
        <button className="btn pri" disabled={busy}>{busy ? "Please wait…" : signup ? "Sign up" : "Log in"}</button>
        <GoogleButton onSuccess={done} onError={setErr} />
        <p className="alt">
          {signup ? <>Already have an account? <Link href="/login">Log in</Link></> : <>New here? <Link href="/signup">Create an account</Link></>}
        </p>
      </form>
    </div>
  );
}
