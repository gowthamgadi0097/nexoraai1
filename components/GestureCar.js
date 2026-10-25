"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Runs fully in the browser with Google MediaPipe (no API key, no server, video never leaves the device).
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";
const MAP = { Open_Palm: "open_palm", Closed_Fist: "closed_fist", Thumb_Up: "thumbs_up", Thumb_Down: "thumbs_down", Pointing_Up: "pointing_up" };
const LABEL = { open_palm: "✋ Open palm", closed_fist: "✊ Fist", thumbs_up: "👍 Thumbs up", thumbs_down: "👎 Thumbs down", pointing_up: "☝️ Index up" };
const HOLD_MS = 1000; // protocol: hold the gesture 1 s to confirm
const COOL_MS = 2500; // protocol: cooldown between actions
const POS = { FL: [62, 80], FR: [178, 80], RL: [62, 150], RR: [178, 150] };
const ALL0 = { FL: 0, FR: 0, RL: 0, RR: 0 };
const GESTURES = [["✋", "Open palm", "Unlock + open front doors"], ["✊", "Fist", "Close + lock doors"], ["👍", "Thumbs up", "Windows down"], ["👎", "Thumbs down", "Windows up"], ["☝️", "Index up", "Stop / hold"]];

export default function GestureCar() {
  const videoRef = useRef(null), streamRef = useRef(null), recRef = useRef(null), rafRef = useRef(0);
  const hold = useRef({ g: null, since: 0 }), cool = useRef(0), lastT = useRef(0), lastKey = useRef(""), drivingRef = useRef(false);
  const applyRef = useRef(() => {});
  const [status, setStatus] = useState("loading"); // loading | live | denied | error
  const [msg, setMsg] = useState("");
  const [seen, setSeen] = useState({ g: "none", p: 0 });
  const [doors, setDoors] = useState(ALL0);
  const [win, setWin] = useState(ALL0);
  const [locked, setLocked] = useState(true);
  const [driving, setDriving] = useState(false);
  const [log, setLog] = useState([]);
  const say = (m) => setLog((l) => [m, ...l].slice(0, 5));
  const all = (v) => ({ FL: v, FR: v, RL: v, RR: v });

  applyRef.current = (g) => {
    const d = drivingRef.current;
    if (g === "open_palm") {
      if (d) return say("🚫 Blocked: doors stay locked while the car is moving.");
      setLocked(false); setDoors({ FL: 1, FR: 1, RL: 0, RR: 0 });
      say("✋ Unlocked and front doors opened (rear child-lock stays on).");
    } else if (g === "closed_fist") {
      setDoors(ALL0); setLocked(true); say("✊ All doors closed and locked.");
    } else if (g === "thumbs_up") {
      setWin(all(d ? 30 : 100)); say(d ? "👍 Windows opened to 30% (maximum while driving)." : "👍 All windows opened.");
    } else if (g === "thumbs_down") {
      setWin(ALL0); say("👎 Windows closing (anti-pinch sensor active).");
    } else if (g === "pointing_up") say("☝️ Stop: doors and windows held in place.");
  };

  const start = useCallback(async () => {
    setStatus("loading"); setMsg("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("no-api"), { name: "NoApi" });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (e) {
      setStatus(e?.name === "NotAllowedError" ? "denied" : "error");
      setMsg(e?.name === "NotAllowedError" ? "Camera permission was blocked. Allow it from the icon in the address bar." : e?.name === "NotFoundError" ? "No camera found on this device." : "Camera needs HTTPS (or localhost) and a free camera.");
      return;
    }
    try {
      if (!recRef.current) {
        const { FilesetResolver, GestureRecognizer } = await import("@mediapipe/tasks-vision");
        const fs = await FilesetResolver.forVisionTasks(WASM);
        const make = (delegate) => GestureRecognizer.createFromOptions(fs, { baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: "VIDEO", numHands: 1 });
        try { recRef.current = await make("GPU"); } catch { recRef.current = await make("CPU"); }
      }
    } catch {
      setStatus("error"); setMsg("Could not load the gesture AI model. Check your internet connection and try again.");
      return;
    }
    setStatus("live");
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const v = videoRef.current, rec = recRef.current;
      if (!v || !rec || v.readyState < 2) return;
      const now = performance.now();
      if (now - lastT.current < 90) return; // about 11 checks per second
      lastT.current = now;
      let g = "none";
      try {
        const c = rec.recognizeForVideo(v, now).gestures?.[0]?.[0];
        if (c && c.score >= 0.6) g = MAP[c.categoryName] || "none";
      } catch {}
      const h = hold.current;
      if (g !== h.g) { h.g = g; h.since = now; }
      const p = g === "none" ? 0 : Math.min(1, (now - h.since) / HOLD_MS);
      const key = `${g}:${Math.round(p * 10)}`;
      if (key !== lastKey.current) { lastKey.current = key; setSeen({ g, p }); }
      if (g !== "none" && p >= 1 && Date.now() >= cool.current) {
        cool.current = Date.now() + COOL_MS; h.since = now;
        applyRef.current(g);
      }
    };
    cancelAnimationFrame(rafRef.current);
    loop();
  }, []);

  useEffect(() => {
    start();
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [start]);

  const toggleDrive = () => {
    const d = !driving;
    setDriving(d); drivingRef.current = d;
    if (d) {
      setDoors(ALL0); setLocked(true);
      setWin((w) => Object.fromEntries(Object.entries(w).map(([k, v]) => [k, Math.min(v, 30)])));
      say("🚗 Moving: doors auto-locked, windows limited to 30%.");
    } else say("🅿️ Parked: doors can be opened by gesture.");
  };

  return (
    <div className="box cam">
      <h3>LIVE CAMERA · HAND GESTURES</h3>
      <div className="camv">
        <video ref={videoRef} muted playsInline style={{ display: status === "live" ? "block" : "none" }} />
        {status !== "live" && <div className="camph">{status === "loading" ? "Starting camera and loading the AI model…" : "Camera is off"}</div>}
        {status === "live" && <div className="gtag">{LABEL[seen.g] || "Show a hand gesture"}<i style={{ width: `${seen.p * 100}%` }} /></div>}
      </div>
      {(status === "denied" || status === "error") && <button className="btn pri" onClick={start}>Enable camera</button>}
      {msg && <div className="err">{msg}</div>}

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
        <ul className="clog">{log.length ? log.map((m, i) => <li key={i}>{m}</li>) : <li>Show a gesture to the camera and hold it for 1 second.</li>}</ul>
      </div>
      <p className="note">Hand detection runs inside your browser with Google MediaPipe. Your camera video is not uploaded anywhere.</p>
    </div>
  );
}
