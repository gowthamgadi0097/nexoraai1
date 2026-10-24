"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const LVL = { ok: "#34d399", warning: "#fbbf24", danger: "#f87171" };
const POS = { FL: [62, 80], FR: [178, 80], RL: [62, 150], RR: [178, 150] };
const ALL0 = { FL: 0, FR: 0, RL: 0, RR: 0 };
const GESTURES = [["✋", "Open palm", "Unlock + open front doors"], ["✊", "Fist", "Close + lock doors"], ["👍", "Thumbs up", "Windows down"], ["👎", "Thumbs down", "Windows up"], ["☝️", "Index up", "Stop / hold"]];

function CarControl({ result }) {
  const [doors, setDoors] = useState(ALL0);
  const [win, setWin] = useState(ALL0); // % open
  const [locked, setLocked] = useState(true);
  const [driving, setDriving] = useState(false);
  const [log, setLog] = useState([]);
  const seen = useRef({ g: null, n: 0 });
  const cool = useRef(0);
  const say = (m) => setLog((l) => [m, ...l].slice(0, 5));
  const setAll = (v) => ({ FL: v, FR: v, RL: v, RR: v });

  useEffect(() => {
    if (!result) return;
    const g = result.hand_visible && result.confidence >= 0.7 ? result.gesture : "none";
    seen.current = g === seen.current.g ? { g, n: seen.current.n + 1 } : { g, n: 1 };
    if (g === "none" || seen.current.n < 2) return; // protocol: same gesture on 2 frames in a row
    if (Date.now() < cool.current) return; // protocol: 3 s cooldown
    cool.current = Date.now() + 3000;
    seen.current = { g: null, n: 0 };
    if (g === "open_palm") {
      if (driving) return say("🚫 Blocked: doors stay locked while the car is moving.");
      setLocked(false); setDoors({ FL: 1, FR: 1, RL: 0, RR: 0 });
      say("✋ Unlocked and front doors opened (rear child-lock stays on).");
    } else if (g === "closed_fist") {
      setDoors(ALL0); setLocked(true); say("✊ All doors closed and locked.");
    } else if (g === "thumbs_up") {
      const max = driving ? 30 : 100;
      setWin(setAll(max)); say(driving ? "👍 Windows opened to 30% (maximum while driving)." : "👍 All windows opened.");
    } else if (g === "thumbs_down") {
      setWin(ALL0); say("👎 Windows closing (anti-pinch sensor active).");
    } else if (g === "pointing_up") say("☝️ Stop: doors and windows held in place.");
  }, [result]); // eslint-disable-line

  const toggleDrive = () => {
    const d = !driving;
    setDriving(d);
    if (d) {
      setDoors(ALL0); setLocked(true);
      setWin((w) => Object.fromEntries(Object.entries(w).map(([k, v]) => [k, Math.min(v, 30)])));
      say("🚗 Moving: doors auto-locked, windows limited to 30%.");
    } else say("🅿️ Parked: doors can be opened by gesture.");
  };

  return (
    <div className="carbox">
      <div className="carhead">
        <b>Virtual car</b>
        <button className={`btn ${driving ? "pri" : ""}`} onClick={toggleDrive}>{driving ? "🚗 Driving (50 km/h)" : "🅿️ Parked"}</button>
      </div>
      <svg viewBox="0 0 240 260" className="car" role="img" aria-label="Top view of car doors and windows">
        <rect x="62" y="20" width="116" height="220" rx="46" fill="#0f1b33" stroke="#22d3ee" strokeWidth="2" />
        {Object.entries(POS).map(([k, [x, y]]) => {
          const left = k.endsWith("L");
          return (
            <g key={k}>
              <rect x={left ? x - 4 : x} y={y} width="4" height="55" rx="2" fill={doors[k] ? "#fbbf24" : "#22d3ee"}
                style={{ transformOrigin: `${x}px ${y}px`, transform: `rotate(${doors[k] ? (left ? 55 : -55) : 0}deg)`, transition: "transform .6s" }} />
              <rect x={left ? 68 : 158} y={y + 8} width="14" height="38" rx="2" fill="none" stroke="#475569" />
              <rect x={left ? 68 : 158} y={y + 8} width="14" height={38 * (1 - win[k] / 100)} rx="2" fill="#0e7490" style={{ transition: "height .6s" }} />
            </g>
          );
        })}
        <text x="120" y="135" textAnchor="middle" fontSize="26">{locked ? "🔒" : "🔓"}</text>
      </svg>
      <div className="glegend">{GESTURES.map(([i, n, a]) => <span key={n}>{i} <b>{n}</b>: {a}</span>)}</div>
      <ul className="clog">{log.length ? log.map((m, i) => <li key={i}>{m}</li>) : <li>Show a gesture to the camera and hold it for about 3 seconds.</li>}</ul>
    </div>
  );
}

function beep() {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    const a = new C(); a.resume?.();
    const o = a.createOscillator(), g = a.createGain();
    o.frequency.value = 880; g.gain.value = 0.15;
    o.connect(g); g.connect(a.destination); o.start();
    setTimeout(() => { o.stop(); a.close(); }, 400);
  } catch {}
}
function speak(t) {
  try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(t)); } catch {}
}

export default function LiveCamera({ slug, label, gesture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const busy = useRef(false);
  const [state, setState] = useState("starting"); // starting | live | denied | error
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [halt, setHalt] = useState(false); // analysis stopped (camera stays on)
  const [sound, setSound] = useState(false);
  const lastAlert = useRef(0);

  const start = useCallback(async () => {
    setErr(""); setState("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("no-api"), { name: "NoApi" });
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      streamRef.current = s;
      videoRef.current.srcObject = s;
      await videoRef.current.play();
      setState("live");
    } catch (e) {
      setState(e?.name === "NotAllowedError" ? "denied" : "error");
      setErr(e?.name === "NotAllowedError" ? "Camera permission was blocked." : e?.name === "NotFoundError" ? "No camera found on this device." : "Camera needs HTTPS (or localhost) and a free camera.");
    }
  }, []);

  useEffect(() => {
    start();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [start]);

  useEffect(() => {
    if (state !== "live" || halt) return;
    const c = document.createElement("canvas");
    const tick = async () => {
      const v = videoRef.current;
      if (busy.current || document.hidden || !v || !v.videoWidth) return;
      busy.current = true;
      try {
        c.width = 480; c.height = Math.round((480 * v.videoHeight) / v.videoWidth);
        c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
        const image = c.toDataURL("image/jpeg", 0.6).split(",")[1];
        const r = await fetch("/api/vision", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, image }) });
        const d = await r.json();
        if (!r.ok) { setErr(d.error || "Analysis failed."); if (d.fatal) setHalt(true); }
        else { setErr(""); setRes({ ...d, t: Date.now() }); }
      } catch { setErr("Network error."); }
      busy.current = false;
    };
    tick();
    const id = setInterval(tick, gesture ? 1400 : 2500);
    return () => clearInterval(id);
  }, [state, slug, gesture, halt]);

  useEffect(() => {
    if (!sound || gesture || !res || !res.level || res.level === "ok") return;
    if (Date.now() - lastAlert.current < (res.level === "danger" ? 5000 : 10000)) return;
    lastAlert.current = Date.now();
    beep();
    speak(`${res.headline}. ${res.action || ""}`);
  }, [res]); // eslint-disable-line

  return (
    <div className="box cam">
      <h3>LIVE CAMERA · {label.toUpperCase()}</h3>
      <div className="camv">
        <video ref={videoRef} muted playsInline style={{ display: state === "live" ? "block" : "none" }} />
        {state !== "live" && <div className="camph">{state === "starting" ? "Starting camera…" : "Camera is off"}</div>}
        {state === "live" && !gesture && res?.level && res.level !== "ok" && (
          <div className={`abanner ${res.level}`}>⚠️ {res.headline}{res.action ? <small>{res.action}</small> : null}</div>
        )}
        {state === "live" && !gesture && res?.level && <span className="lvl" style={{ background: LVL[res.level] || LVL.ok }}>{res.level.toUpperCase()}</span>}
      </div>
      {!gesture && <button className="btn" onClick={() => { const v = !sound; setSound(v); if (v) { beep(); speak("Sound alerts on"); } }}>{sound ? "🔔 Sound alerts ON" : "🔕 Turn on sound alerts"}</button>}
      {(state === "denied" || state === "error") && <button className="btn pri" onClick={start}>Enable camera</button>}
      {state === "live" && halt && <button className="btn pri" onClick={() => { setHalt(false); setErr(""); }}>Retry analysis</button>}
      {err && <div className="err">{err}</div>}
      {res && !gesture && (
        <div className="cres">
          <b>{res.headline}</b>
          <ul>{(res.details || []).map((d, i) => <li key={i}>{d}</li>)}</ul>
          {res.action && <p>🚘 Car action: {res.action}</p>}
        </div>
      )}
      {gesture && res && <p className="cres"><b>Seen:</b> {res.hand_visible ? `${res.gesture} (${Math.round((res.confidence || 0) * 100)}%)` : "no hand"}</p>}
      {gesture && <CarControl result={res} />}
      <p className="note">The camera starts automatically (your browser asks permission). Frames are sent to Google Gemini for analysis and are not stored by NEXORA AI.</p>
    </div>
  );
}
