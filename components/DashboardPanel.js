"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FEATURES } from "@/lib/features";

const CATS = {
  Predict: ["road-danger-predictor", "collision-risk-predictor", "future-accident-simulator", "vehicle-intention-predictor", "invisible-road-hazard-detector", "smart-safe-route-finder"],
  Protect: ["rain-flood-protection", "night-vision-pedestrian-guardian", "anti-door-crash", "emergency-accident-detection"],
  Driver: ["driver-drowsiness-detection", "driver-distraction-detection", "gesture-controlled-functions"],
  Connect: ["car-to-car-communication", "unified-safety-dashboard"],
  Health: ["predictive-vehicle-maintenance", "air-quality-cabin-monitor"],
};
const CAT_OF = {};
Object.entries(CATS).forEach(([c, list]) => list.forEach((s) => (CAT_OF[s] = c)));

const EVENTS = [
  ["warn", "Pothole cluster 220 m ahead, easing speed"],
  ["info", "Car-to-car: lead vehicle braking hard, 3 cars linked"],
  ["warn", "Pedestrian detected at 90 m (thermal), alert shown"],
  ["ok", "Safe route updated: avoids flooded underpass"],
  ["warn", "Driver eyes off road 1.8 s, gentle alert"],
  ["info", "Rear cyclist detected, door lock held"],
  ["ok", "Cabin CO2 normal, fresh-air mode on"],
  ["warn", "Black ice predicted on bridge, grip control armed"],
  ["info", "Brake pads 82% health, service in 3,400 km"],
  ["ok", "Collision risk dropped to LOW after lane change"],
  ["warn", "Neighbour car likely to cut in, pre-braking"],
  ["info", "Drowsiness check: alert, blink rate normal"],
];

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function Gauge({ label, value, unit, max = 100, color }) {
  const pct = clamp(value / max, 0, 1);
  const r = 44, c = 2 * Math.PI * r;
  return (
    <div className="gauge">
      <svg viewBox="0 0 110 110" role="img" aria-label={`${label} ${Math.round(value)} ${unit}`}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(148,163,184,.18)" strokeWidth="9" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 55 55)" style={{ transition: "stroke-dasharray .6s" }} />
        <text x="55" y="54" textAnchor="middle" fill="#e2e8f0" fontSize="22" fontWeight="800">{Math.round(value)}</text>
        <text x="55" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10">{unit}</text>
      </svg>
      <span>{label}</span>
    </div>
  );
}

export default function DashboardPanel({ name }) {
  const [t, setT] = useState({ speed: 62, risk: 18, alert: 94, air: 96, health: 91, battery: 78 });
  const [on, setOn] = useState(() => Object.fromEntries(FEATURES.map((f) => [f.slug, true])));
  const [log, setLog] = useState([]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const idx = useRef(0);

  // Simulated live telemetry (demo data, not a real vehicle feed).
  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => ({
        speed: clamp(p.speed + rand(-6, 6), 20, 110),
        risk: clamp(p.risk + rand(-9, 9), 3, 95),
        alert: clamp(p.alert + rand(-3, 3), 60, 100),
        air: clamp(p.air + rand(-2, 2), 70, 100),
        health: clamp(p.health + rand(-0.4, 0.2), 70, 100),
        battery: clamp(p.battery - 0.05, 20, 100),
      }));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const push = () => {
      const [lvl, msg] = EVENTS[idx.current++ % EVENTS.length];
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLog((l) => [{ id: Date.now() + Math.random(), lvl, msg, time }, ...l].slice(0, 7));
    };
    push();
    const id = setInterval(push, 3200);
    return () => clearInterval(id);
  }, []);

  const riskLabel = t.risk < 30 ? "LOW" : t.risk < 60 ? "MEDIUM" : "HIGH";
  const riskColor = t.risk < 30 ? "#34d399" : t.risk < 60 ? "#fbbf24" : "#f87171";
  const active = Object.values(on).filter(Boolean).length;

  const list = useMemo(
    () => FEATURES.filter((f) => (cat === "All" || CAT_OF[f.slug] === cat) && f.title.toLowerCase().includes(q.trim().toLowerCase())),
    [cat, q]
  );

  return (
    <main className="wrap sec">
      <div className="dhead">
        <div>
          <h2>Welcome, {name} 👋</h2>
          <p className="sub">NEXORA AI unified safety dashboard. Telemetry below is a live simulation for the demo.</p>
        </div>
        <div className="sysbadge"><i /> {active}/{FEATURES.length} AI systems active</div>
      </div>

      <div className="dgrid">
        <section className="dcard span2">
          <h3>LIVE VEHICLE STATUS</h3>
          <div className="gauges">
            <Gauge label="Speed" value={t.speed} unit="km/h" max={120} color="#22d3ee" />
            <Gauge label="Collision risk" value={t.risk} unit={riskLabel} color={riskColor} />
            <Gauge label="Driver alertness" value={t.alert} unit="%" color="#34d399" />
            <Gauge label="Cabin air" value={t.air} unit="AQI score" color="#3b82f6" />
            <Gauge label="Vehicle health" value={t.health} unit="%" color="#a78bfa" />
            <Gauge label="Battery" value={t.battery} unit="%" color="#fbbf24" />
          </div>
        </section>

        <section className="dcard">
          <h3>LIVE AI ALERTS</h3>
          <ul className="feed">
            {log.map((e) => (
              <li key={e.id} className={e.lvl}><span>{e.time}</span>{e.msg}</li>
            ))}
          </ul>
        </section>

        <section className="dcard span3">
          <h3>AI SYSTEMS (tap a switch to arm or disarm)</h3>
          <div className="sys">
            {FEATURES.map((f) => (
              <div key={f.slug} className={`sysi ${on[f.slug] ? "" : "off"}`}>
                <Link href={`/feature/${f.slug}`} title="Open demo">{f.icon} {f.title}</Link>
                <button
                  role="switch"
                  aria-checked={on[f.slug]}
                  aria-label={`${f.title} ${on[f.slug] ? "on" : "off"}`}
                  className={`sw ${on[f.slug] ? "on" : ""}`}
                  onClick={() => setOn((o) => ({ ...o, [f.slug]: !o[f.slug] }))}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <h2 className="mt">Feature explorer</h2>
      <p className="sub">Open any feature to see what it is, how it helps in cars, and its AI reference video.</p>
      <div className="tools">
        <div className="tabs">
          {["All", ...Object.keys(CATS)].map((c) => (
            <button key={c} className={`tab ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <input className="search" placeholder="Search features…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search features" />
      </div>
      <div className="grid">
        {list.map((f) => (
          <Link key={f.slug} href={`/feature/${f.slug}`} className="fc">
            <span className="no">{CAT_OF[f.slug]}</span>
            <div className="ic">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.tagline}</p>
            <div className="go">Watch AI demo →</div>
          </Link>
        ))}
        {list.length === 0 && <p className="sub">No feature matches that search.</p>}
      </div>
    </main>
  );
}
