// Canvas "reference simulation" scenes for each NEXORA AI feature.
// Each scene is a pure function: (ctx, t, st) where t = seconds in the 12 s loop.
export const W = 640;
export const H = 400;
export const LOOP = 12;

const RL = 190, RR = 450, L1 = 255, L2 = 385, EY = 315;
const CY = "#22d3ee", GR = "#34d399", AM = "#fbbf24", RD = "#f87171", MU = "#94a3b8";

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = (t, a, b) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const wy = (st, D) => EY - (D - st.dist);

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function txt(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.bold ? "700 " : ""}${o.size || 12}px system-ui, sans-serif`;
  ctx.fillStyle = o.c || "#e2e8f0";
  ctx.textAlign = o.align || "left";
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
  ctx.restore();
}
function tag(ctx, s, x, y, col = CY) {
  ctx.save();
  ctx.font = "700 11px system-ui, sans-serif";
  const w = ctx.measureText(s).width + 16;
  ctx.fillStyle = "rgba(2,6,23,.85)";
  rr(ctx, x - w / 2, y - 11, w, 22, 6);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y + 0.5);
  ctx.restore();
}
function meter(ctx, x, y, w, v, col, h = 8) {
  ctx.fillStyle = "rgba(148,163,184,.2)";
  rr(ctx, x, y, w, h, h / 2); ctx.fill();
  ctx.fillStyle = col;
  rr(ctx, x, y, Math.max(h, w * clamp(v)), h, h / 2); ctx.fill();
}
function card(ctx, x, y, w, h, title) {
  ctx.fillStyle = "rgba(15,23,42,.92)";
  rr(ctx, x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = "rgba(34,211,238,.35)";
  ctx.lineWidth = 1;
  ctx.stroke();
  if (title) txt(ctx, title, x + 12, y + 18, { size: 11, bold: true, c: CY });
}
function side(ctx, title, rows) {
  card(ctx, 462, 14, 168, 372, title);
  rows.forEach((r, i) => {
    const y = 52 + i * 52;
    txt(ctx, r.k, 476, y, { size: 10, c: MU });
    txt(ctx, r.v, 476, y + 16, { size: 13, bold: true, c: r.c || "#e2e8f0" });
    if (r.m !== undefined) meter(ctx, 476, y + 28, 140, r.m, r.c || CY, 6);
  });
}
function road(ctx, st, o = {}) {
  ctx.fillStyle = o.bg || "#0b1220";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = o.road || "#1e293b";
  ctx.fillRect(RL, 0, RR - RL, H);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(RL, 0, 3, H);
  ctx.fillRect(RR - 3, 0, 3, H);
  ctx.fillStyle = "rgba(226,232,240,.75)";
  for (let y = -40 + (st.scroll % 40); y < H; y += 40) ctx.fillRect(318, y, 4, 22);
  ctx.fillStyle = "rgba(34,211,238,.25)";
  for (let y = -80 + (st.scroll % 80); y < H; y += 80) {
    ctx.beginPath(); ctx.arc(150, y, 4, 0, 6.3); ctx.fill();
  }
}
function car(ctx, x, y, color = "#38bdf8", o = {}) {
  const w = o.w || 34, h = o.h || 60;
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.fillStyle = color;
  rr(ctx, -w / 2, -h / 2, w, h, 8); ctx.fill();
  ctx.fillStyle = "rgba(10,20,40,.78)";
  rr(ctx, -w / 2 + 4, -h / 2 + 10, w - 8, 14, 4); ctx.fill();
  rr(ctx, -w / 2 + 4, h / 2 - 20, w - 8, 10, 3); ctx.fill();
  const hz = o.hazard && Math.floor((o.t || 0) * 3) % 2 === 0;
  ctx.fillStyle = o.brake ? "#ff2d2d" : "#7f1d1d";
  ctx.fillRect(-w / 2 + 2, h / 2 - 4, 8, 4);
  ctx.fillRect(w / 2 - 10, h / 2 - 4, 8, 4);
  ctx.fillStyle = "#fef9c3";
  ctx.fillRect(-w / 2 + 2, -h / 2, 8, 3);
  ctx.fillRect(w / 2 - 10, -h / 2, 8, 3);
  if (hz) {
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(-w / 2 - 3, -h / 2 + 4, 4, 6); ctx.fillRect(w / 2 - 1, -h / 2 + 4, 4, 6);
    ctx.fillRect(-w / 2 - 3, h / 2 - 10, 4, 6); ctx.fillRect(w / 2 - 1, h / 2 - 10, 4, 6);
  }
  ctx.restore();
}
function dashed(ctx, x1, y1, x2, y2, col, w = 2) {
  ctx.save();
  ctx.setLineDash([6, 5]); ctx.strokeStyle = col; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.restore();
}
function face(ctx, cx, cy, eye, o = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  if (o.rot) ctx.rotate(o.rot);
  ctx.fillStyle = "#fcd9b6";
  ctx.beginPath(); ctx.ellipse(0, 0, 78, 96, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath(); ctx.ellipse(0, -62, 80, 44, 0, Math.PI, 6.3); ctx.fill();
  const gx = o.gx || 0, gy = o.gy || 0;
  for (const ex of [-32, 32]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(ex + gx * 0.4, -12, 16, Math.max(1.5, 11 * eye), 0, 0, 6.3); ctx.fill();
    if (eye > 0.2) {
      ctx.fillStyle = "#0f172a";
      ctx.beginPath(); ctx.arc(ex + gx, -12 + gy, 5.5, 0, 6.3); ctx.fill();
    }
    ctx.strokeStyle = GR; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(ex + gx * 0.4, -12, 20, Math.max(3, 14 * eye + 3), 0, 0, 6.3); ctx.stroke();
  }
  ctx.strokeStyle = "#b45309"; ctx.lineWidth = 3;
  ctx.beginPath();
  if (o.mouth) ctx.ellipse(0, 52, 20, 6 + 22 * o.mouth, 0, 0, 6.3);
  else { ctx.moveTo(-18, 52); ctx.quadraticCurveTo(0, 58, 18, 52); }
  ctx.stroke();
  ctx.restore();
}

export const SCENES = {
  "road-danger-predictor": (ctx, t, st) => {
    st.speed = 1;
    road(ctx, st);
    const hy = wy(st, 560);
    const ex = lerp(L2, L1, sm(t, 3.2, 4.6));
    const d = EY - 30 - hy;
    if (hy > EY - 40) {
      ctx.fillStyle = "rgba(52,211,153,.16)"; ctx.fillRect(L1 - 55, 20, 110, EY - 60);
    } else if (hy > 20) {
      const g = ctx.createLinearGradient(0, EY - 40, 0, hy);
      g.addColorStop(0, "rgba(52,211,153,.22)"); g.addColorStop(1, "rgba(248,113,113,.5)");
      ctx.fillStyle = g; ctx.fillRect(L2 - 55, hy - 20, 110, EY - 40 - hy + 20);
    }
    if (hy > -30 && hy < H + 30) {
      ctx.fillStyle = "#0b1220"; ctx.beginPath(); ctx.ellipse(L2, hy, 30, 17, 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = RD; ctx.lineWidth = 2; ctx.stroke();
    }
    const dy = wy(st, 900);
    if (dy > -20 && dy < H) { ctx.fillStyle = "#64748b"; ctx.fillRect(L1 - 10, dy, 20, 8); }
    if (d > 0 && d < 300 && t < 4.6) {
      dashed(ctx, ex, EY - 30, L2, hy, RD);
      tag(ctx, "POTHOLE " + Math.round(d / 6) + " m", L2, hy - 24, RD);
    }
    car(ctx, ex, EY, "#38bdf8");
    const r = hy > EY + 30 ? 8 : 8 + 85 * clamp(1 - d / 320);
    const rc = r > 60 ? RD : r > 30 ? AM : GR;
    side(ctx, "ROAD DANGER PREDICTOR", [
      { k: "RISK AHEAD", v: Math.round(r) + "%", c: rc, m: r / 100 },
      { k: "STATUS", v: r > 60 ? "DANGER AHEAD" : r > 30 ? "CAUTION" : "CLEAR", c: rc },
      { k: "ACTION", v: t > 2.8 && t < 5 ? "Lane change →" : "Monitoring", c: CY },
      { k: "SCAN RANGE", v: "300 m", c: "#e2e8f0" },
    ]);
  },

  "rain-flood-protection": (ctx, t, st) => {
    const fy0 = 800;
    const d = fy0 - st.dist - 70;
    st.speed = clamp(d / 260, 0, 1);
    road(ctx, st, { bg: "#0a1020", road: "#17233a" });
    const fy = wy(st, fy0);
    if (fy > -120 && fy < H + 20) {
      ctx.fillStyle = "rgba(56,189,248,.5)"; ctx.fillRect(RL, fy - 55, RR - RL, 110);
      ctx.strokeStyle = "rgba(186,230,253,.7)"; ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        for (let x = RL; x <= RR; x += 8) { const y = fy - 40 + i * 16 + Math.sin(x / 14 + t * 3 + i) * 3; x === RL ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
    }
    car(ctx, L2, EY, "#38bdf8", { brake: st.speed < 0.6 });
    ctx.strokeStyle = "rgba(186,230,253,.55)"; ctx.lineWidth = 1.2;
    for (let i = 0; i < 90; i++) {
      const x = (i * 71) % W, y = ((i * 37 + t * 420) % (H + 40)) - 20;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 12); ctx.stroke();
    }
    const near = d < 330;
    if (near && fy > 0) tag(ctx, "FLOOD AHEAD", 320, Math.max(30, fy - 75), RD);
    if (d < 60) tag(ctx, "AUTO-BRAKE • REROUTING", 320, 60, AM);
    side(ctx, "RAIN & FLOOD GUARD", [
      { k: "RAIN INTENSITY", v: "HEAVY 78%", c: CY, m: 0.78 },
      { k: "WATER DEPTH", v: near ? "32 cm DANGER" : "0 cm", c: near ? RD : GR, m: near ? 0.85 : 0.02 },
      { k: "SPEED", v: Math.round(60 * st.speed) + " km/h", c: "#e2e8f0" },
      { k: "ACTION", v: d < 60 ? "Stopped, new route" : near ? "Braking" : "Wipers + traction", c: near ? AM : GR },
    ]);
  },

  "night-vision-pedestrian-guardian": (ctx, t, st) => {
    const D = 650;
    const px = 150 + 62 * Math.max(0, t - 1);
    const pyScr = wy(st, D);
    const d = EY - 30 - pyScr;
    st.speed = clamp((d - 40) / 200, 0, 1);
    road(ctx, st, { bg: "#03060d", road: "#0d1424" });
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createLinearGradient(0, EY, 0, EY - 190);
    g.addColorStop(0, "rgba(254,243,199,.35)"); g.addColorStop(1, "rgba(254,243,199,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(L2 - 12, EY - 30); ctx.lineTo(L2 - 70, EY - 190); ctx.lineTo(L2 + 70, EY - 190); ctx.lineTo(L2 + 12, EY - 30); ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0, 0, W, H);
    car(ctx, L2, EY, "#1d4ed8", { brake: st.speed < 0.7 });
    if (pyScr > -30 && pyScr < H) {
      const gl = ctx.createRadialGradient(px, pyScr, 2, px, pyScr, 34);
      gl.addColorStop(0, "rgba(253,186,116,.95)"); gl.addColorStop(1, "rgba(253,186,116,0)");
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(px, pyScr, 34, 0, 6.3); ctx.fill();
      ctx.fillStyle = "#fed7aa"; ctx.beginPath(); ctx.arc(px, pyScr, 8, 0, 6.3); ctx.fill();
      ctx.strokeStyle = GR; ctx.lineWidth = 2; ctx.strokeRect(px - 20, pyScr - 20, 40, 40);
      tag(ctx, "PERSON " + Math.max(1, Math.round(d / 4)) + " m", px, pyScr - 34, GR);
    }
    if (d < 140 && t > 2) tag(ctx, "EMERGENCY BRAKING", 320, 40, RD);
    side(ctx, "NIGHT VISION GUARDIAN", [
      { k: "VISIBILITY", v: "DARK 0.1 lux", c: MU },
      { k: "THERMAL SCAN", v: "ACTIVE", c: GR },
      { k: "DETECTED", v: pyScr > 0 ? "1 pedestrian" : "none", c: pyScr > 0 ? AM : GR },
      { k: "ACTION", v: d < 140 ? "Auto-brake" : "Alert driver", c: d < 140 ? RD : CY },
    ]);
  },

  "gesture-controlled-functions": (ctx, t, st) => {
    st.speed = 0.4;
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#111c33"; rr(ctx, 20, 20, 420, 360, 18); ctx.fill();
    ctx.strokeStyle = "rgba(148,163,184,.4)"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(230, 520, 190, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    const ph = Math.min(3, Math.floor(t / 3));
    const lt = (t % 3) / 3;
    const names = ["SWIPE UP", "OPEN PALM", "SWIPE RIGHT", "THUMBS UP"];
    const acts = ["Volume +", "Answer call", "Next track", "AC set 22°C"];
    let hx = 230, hy = 230;
    if (ph === 0) hy = 300 - 120 * lt;
    if (ph === 1) hy = 230;
    if (ph === 2) hx = 150 + 160 * lt;
    if (ph === 3) hy = 230 + 5 * Math.sin(t * 6);
    ctx.save(); ctx.translate(hx, hy);
    ctx.fillStyle = "#fcd9b6"; rr(ctx, -30, -10, 60, 62, 14); ctx.fill();
    const fl = ph === 1 ? 1 : ph === 3 ? 0.2 : 0.8;
    for (let i = 0; i < 4; i++) { rr(ctx, -30 + i * 15.5, -10 - 46 * fl, 12, 46 * fl + 6, 6); ctx.fill(); }
    rr(ctx, ph === 3 ? -52 : -46, ph === 3 ? -50 : 4, 14, ph === 3 ? 48 : 30, 7); ctx.fill();
    ctx.fillStyle = CY;
    [[-24, 30], [0, 30], [24, 30], [-24, -20 - 46 * fl], [-9, -24 - 46 * fl], [6, -24 - 46 * fl], [21, -20 - 46 * fl]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 6.3); ctx.fill(); });
    ctx.strokeStyle = CY; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.strokeRect(-62, -78, 124, 150); ctx.restore();
    txt(ctx, "CABIN CAMERA", 36, 40, { size: 10, bold: true, c: CY });
    card(ctx, 462, 14, 168, 372, "GESTURE CONTROL");
    txt(ctx, "GESTURE", 476, 58, { size: 10, c: MU });
    txt(ctx, names[ph], 476, 76, { size: 14, bold: true, c: GR });
    txt(ctx, "ACTION", 476, 116, { size: 10, c: MU });
    txt(ctx, acts[ph], 476, 134, { size: 14, bold: true, c: "#e2e8f0" });
    txt(ctx, "CONFIDENCE", 476, 174, { size: 10, c: MU });
    meter(ctx, 476, 184, 140, 0.9 + 0.08 * Math.sin(t * 3), GR);
    if (ph === 0) { txt(ctx, "VOLUME", 476, 224, { size: 10, c: MU }); meter(ctx, 476, 234, 140, 0.3 + 0.6 * lt, CY, 10); }
    if (ph === 1) tag(ctx, "CALL CONNECTED", 546, 240, GR);
    if (ph === 2) tag(ctx, "NEXT TRACK ▶▶", 546, 240, CY);
    if (ph === 3) tag(ctx, "22°C  AC ON", 546, 240, AM);
    txt(ctx, "Eyes stay on the road", 476, 340, { size: 11, c: MU });
  },

  "car-to-car-communication": (ctx, t, st) => {
    st.speed = 1 - 0.8 * sm(t, 3.4, 4.6);
    road(ctx, st);
    ctx.fillStyle = "#0f1a2e"; ctx.fillRect(RR + 2, 0, 12, H);
    ctx.fillStyle = "#0b1426"; ctx.fillRect(0, 60, 180, 170);
    txt(ctx, "BLIND BEND / BUILDING", 14, 145, { size: 10, c: "#475569" });
    const brk = t > 3;
    const cars = [[L2, 110, "#f97316"], [L2, 215, "#a78bfa"], [L2, 315, "#38bdf8"]];
    cars.forEach(([x, y, c], i) => car(ctx, x, y, c, { brake: brk && (i === 0 || t > 3.6 + i * 0.3) }));
    if (t > 3.2) {
      for (let k = 0; k < 3; k++) {
        const r = ((t - 3.2) * 140 + k * 70) % 210;
        ctx.strokeStyle = `rgba(34,211,238,${0.6 * (1 - r / 210)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(L2, 110, r, 0, 6.3); ctx.stroke();
      }
      dashed(ctx, L2, 110, L2, 215, CY); dashed(ctx, L2, 215, L2, 315, CY);
    }
    if (t > 3.6) tag(ctx, "HARD BRAKE AHEAD", L2 - 110, 215, AM);
    if (t > 4) tag(ctx, "ALERT RECEIVED", L2 - 110, 315, RD);
    side(ctx, "CAR-TO-CAR (V2V)", [
      { k: "NEARBY CARS", v: "3 connected", c: GR },
      { k: "MESSAGE RATE", v: "10 / sec", c: "#e2e8f0" },
      { k: "EVENT", v: t > 3 ? "Hard brake" : "Normal", c: t > 3 ? RD : GR },
      { k: "WARNING SENT", v: t > 3.2 ? "to 2 cars" : "-", c: CY },
    ]);
  },

  "anti-door-crash": (ctx, t, st) => {
    st.speed = 0;
    road(ctx, st);
    ctx.fillStyle = "#0f1a2e"; ctx.fillRect(RR, 0, 60, H);
    const cyc = 470 - 72 * t;
    const blocked = t > 1.2 && t < 5.5;
    const ang = t >= 5.8 ? 1.15 * sm(t, 5.8, 7) : blocked ? 0.12 * Math.abs(Math.sin(t * 4)) : 0;
    car(ctx, 415, 240, "#38bdf8", { w: 36, h: 66 });
    ctx.save(); ctx.translate(433, 225); ctx.rotate(ang);
    ctx.strokeStyle = blocked ? RD : GR; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.stroke(); ctx.restore();
    ctx.fillStyle = "rgba(34,211,238,.1)"; ctx.fillRect(RR, 80, 60, 300);
    if (cyc > -30 && cyc < H + 30) {
      ctx.strokeStyle = "#fcd34d"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(470, cyc + 14, 8, 0, 6.3); ctx.stroke();
      ctx.beginPath(); ctx.arc(470, cyc - 14, 8, 0, 6.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(470, cyc - 14); ctx.lineTo(470, cyc + 14); ctx.stroke();
      ctx.fillStyle = "#fb923c"; ctx.beginPath(); ctx.arc(470, cyc - 4, 5, 0, 6.3); ctx.fill();
      if (cyc < 400 && cyc > 80) tag(ctx, "CYCLIST " + Math.max(1, Math.round((cyc - 240) / 6) | 0) + " m", 390, cyc - 28 < 30 ? 30 : cyc - 28, AM);
    }
    if (blocked) tag(ctx, "🔒 DOOR LOCKED", 330, 160, RD);
    side(ctx, "ANTI-DOOR-CRASH", [
      { k: "REAR RADAR", v: cyc > 80 && cyc < 400 ? "Cyclist approaching" : "Zone clear", c: cyc > 80 && cyc < 400 ? AM : GR },
      { k: "DOOR", v: blocked ? "LOCKED" : "UNLOCKED", c: blocked ? RD : GR },
      { k: "PASSENGER", v: blocked ? "Light + sound alert" : "Safe to exit", c: CY },
      { k: "RISK", v: blocked ? "HIGH" : "LOW", c: blocked ? RD : GR },
    ]);
  },

  "driver-drowsiness-detection": (ctx, t, st) => {
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#111c33"; rr(ctx, 20, 20, 420, 360, 18); ctx.fill();
    const f = 0.9 * sm(t, 0, 9.5);
    const blink = 0.5 + 0.5 * Math.sin(t * (2 + f * 4));
    const eye = clamp(1 - f * (0.35 + 0.65 * blink) - 0.1 * f);
    const yawn = t > 6.2 && t < 8.4 ? Math.sin(((t - 6.2) / 2.2) * Math.PI) : 0;
    face(ctx, 230, 210, eye, { mouth: yawn, rot: 0.14 * f * Math.sin(t * 1.6) });
    txt(ctx, "DRIVER CAMERA • FACE MESH", 36, 40, { size: 10, bold: true, c: CY });
    const col = f > 0.7 ? RD : f > 0.4 ? AM : GR;
    if (f > 0.7 && Math.floor(t * 3) % 2 === 0) { ctx.strokeStyle = RD; ctx.lineWidth = 6; rr(ctx, 20, 20, 420, 360, 18); ctx.stroke(); }
    if (f > 0.7) tag(ctx, "⚠ WAKE UP – SEAT VIBRATING", 230, 352, RD);
    else if (f > 0.4) tag(ctx, "DROWSY – TAKE A BREAK", 230, 352, AM);
    side(ctx, "DROWSINESS DETECTION", [
      { k: "FATIGUE SCORE", v: Math.round(f * 100) + "%", c: col, m: f },
      { k: "EYE CLOSURE", v: Math.round((1 - eye) * 100) + "%", c: "#e2e8f0" },
      { k: "YAWNS", v: t > 8.4 ? "1 detected" : "0", c: t > 8.4 ? AM : GR },
      { k: "ACTION", v: t > 10.5 ? "Slowing to safe stop" : f > 0.7 ? "Alarm + vibration" : f > 0.4 ? "Rest-stop tip" : "Monitoring", c: col },
    ]);
  },

  "driver-distraction-detection": (ctx, t, st) => {
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#111c33"; rr(ctx, 20, 20, 420, 360, 18); ctx.fill();
    const look = sm(t, 3, 3.6) * (1 - sm(t, 9.2, 9.8));
    face(ctx, 210, 200, 1, { gx: 12 * look, gy: 9 * look, rot: 0.1 * look });
    if (look > 0.05) {
      ctx.save(); ctx.translate(345, 300); ctx.rotate(-0.2);
      ctx.fillStyle = "#0f172a"; rr(ctx, -22, -40, 44, 80, 7); ctx.fill();
      ctx.fillStyle = "#38bdf8"; rr(ctx, -18, -34, 36, 66, 4); ctx.fill(); ctx.restore();
      dashed(ctx, 220, 200, 340, 290, AM);
    }
    const off = t > 3.4 && t < 9.4 ? t - 3.4 : 0;
    txt(ctx, "DRIVER CAMERA • GAZE TRACKING", 36, 40, { size: 10, bold: true, c: CY });
    if (off > 2) tag(ctx, "LOOK AT THE ROAD!", 230, 352, RD);
    else if (off > 0) tag(ctx, "PHONE IN HAND", 230, 352, AM);
    const col = off > 2 ? RD : off > 0 ? AM : GR;
    side(ctx, "DISTRACTION DETECTION", [
      { k: "GAZE", v: look > 0.5 ? "OFF ROAD" : "ON ROAD", c: col },
      { k: "OFF-ROAD TIME", v: off.toFixed(1) + " s", c: col, m: off / 4 },
      { k: "PHONE", v: look > 0.5 ? "Detected" : "No", c: look > 0.5 ? AM : GR },
      { k: "CAR RESPONSE", v: off > 2 ? "Alert + brakes primed" : "Normal", c: off > 2 ? RD : CY },
    ]);
  },

  "emergency-accident-detection": (ctx, t, st) => {
    st.speed = t < 4 ? 1 : Math.max(0, 1 - (t - 4) * 6);
    road(ctx, st);
    ctx.save();
    if (t > 4 && t < 4.6) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    const oy = wy(st, 540);
    car(ctx, L2, oy, "#64748b", { hazard: t > 4, t });
    car(ctx, L2, EY + (t > 4 ? -4 : 0), "#38bdf8", { hazard: t > 4.4, t, brake: t > 3.8 });
    ctx.restore();
    if (t > 4 && t < 4.5) { ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - (t - 4) / 0.5)})`; ctx.fillRect(0, 0, W, H); }
    if (t > 4 && t < 5.5) for (let i = 0; i < 14; i++) { const a = i * 0.45, r = (t - 4) * 60; ctx.fillStyle = AM; ctx.fillRect(L2 + Math.cos(a) * r, EY - 34 + Math.sin(a) * r, 3, 3); }
    if (t > 8) {
      const ay = 470 - 70 * (t - 8);
      ctx.fillStyle = "#f8fafc"; rr(ctx, L1 - 17, ay - 34, 34, 68, 6); ctx.fill();
      ctx.fillStyle = Math.floor(t * 6) % 2 ? RD : "#3b82f6"; ctx.fillRect(L1 - 12, ay - 26, 24, 7);
    }
    const items = [["Crash detected: 62 → 0 km/h", 4.4], ["Airbags deployed", 4.9], ["Hazard lights ON", 5.4], ["Calling emergency services…", 6.2], ["Location + severity sent ✔", 7.4], ["Family contact notified ✔", 8.6]];
    card(ctx, 462, 14, 168, 372, "ACCIDENT DETECTION");
    txt(ctx, t > 4.4 ? "CRASH CONFIRMED" : "DRIVING NORMALLY", 476, 46, { size: 12, bold: true, c: t > 4.4 ? RD : GR });
    items.forEach(([s, at], i) => { if (t > at) txt(ctx, s, 476, 84 + i * 40, { size: 10.5, c: i === 3 && t < 7.4 ? AM : "#e2e8f0" }); });
    if (t > 9.4) tag(ctx, "HELP ON THE WAY", 546, 350, GR);
  },

  "collision-risk-predictor": (ctx, t, st) => {
    st.speed = (1 - 0.95 * sm(t, 3.2, 4.4)) + 0.95 * sm(t, 7.2, 8.6) * 0.8;
    road(ctx, st);
    const by = wy(st, 700);
    ctx.fillStyle = "#17233a"; ctx.fillRect(0, by - 34, W, 68);
    ctx.fillStyle = "rgba(226,232,240,.5)"; for (let x = 0; x < W; x += 36) ctx.fillRect(x, by - 1, 20, 2);
    const cx = 1000 - 100 * t;
    const crossY = by;
    car(ctx, cx, crossY, "#f97316", { rot: -Math.PI / 2 });
    car(ctx, L2, EY, "#38bdf8", { brake: t > 3.2 && t < 7.4 });
    const risk = t < 4.4 ? clamp((t - 1) / 3.4) * 92 : 92 * (1 - sm(t, 4.4, 7)) + 8;
    const rc = risk > 60 ? RD : risk > 30 ? AM : GR;
    if (cx < 640 && t < 7) {
      dashed(ctx, L2, EY - 34, L2, crossY, rc); dashed(ctx, cx - 30, crossY, L2, crossY, rc);
      ctx.strokeStyle = rc; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(L2, crossY, 16, 0, 6.3); ctx.stroke();
    }
    const ttc = Math.max(0, 5.6 - t);
    if (t < 4.4 && t > 1.5) tag(ctx, "TTC " + ttc.toFixed(1) + " s", 320, 40, rc);
    if (t >= 3.2 && t < 7) tag(ctx, "AUTO-BRAKE", 320, 40, RD);
    side(ctx, "COLLISION RISK", [
      { k: "COLLISION RISK", v: Math.round(risk) + "%", c: rc, m: risk / 100 },
      { k: "TRACKED OBJECTS", v: "2", c: "#e2e8f0" },
      { k: "TIME TO COLLISION", v: t < 4.4 ? ttc.toFixed(1) + " s" : "avoided", c: t < 4.4 ? rc : GR },
      { k: "ACTION", v: t >= 3.2 && t < 7 ? "Brake + belts" : t >= 7 ? "Resume" : "Monitor", c: CY },
    ]);
  },

  "smart-safe-route-finder": (ctx, t, st) => {
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 14;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(40, 60 + i * 70); ctx.lineTo(440, 60 + i * 70); ctx.stroke(); }
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(50 + i * 78, 30); ctx.lineTo(50 + i * 78, 370); ctx.stroke(); }
    [[206, 200], [362, 130]].forEach(([x, y]) => { ctx.fillStyle = "rgba(248,113,113,.28)"; ctx.beginPath(); ctx.arc(x, y, 46, 0, 6.3); ctx.fill(); txt(ctx, "RISK ZONE", x, y, { size: 9, bold: true, c: RD, align: "center" }); });
    const fast = [[50, 340], [50, 200], [206, 200], [362, 200], [362, 130], [440, 130], [440, 60]];
    const safe = [[50, 340], [128, 340], [128, 270], [284, 270], [284, 60], [440, 60]];
    const draw = (pts, k, col, w) => {
      const lens = []; let tot = 0;
      for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
      let rem = tot * clamp(k); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(...pts[0]);
      let pos = pts[0];
      for (let i = 0; i < lens.length && rem > 0; i++) {
        const u = Math.min(1, rem / lens[i]); pos = [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]; ctx.lineTo(...pos); rem -= lens[i];
      }
      ctx.stroke(); return pos;
    };
    draw(fast, sm(t, 1, 3.5), "rgba(248,113,113,.9)", 5);
    const p = draw(safe, sm(t, 4, 7), GR, 6);
    if (t > 7.2) { const q = draw(safe, sm(t, 7.2, 11.5), "#bbf7d0", 3); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(q[0], q[1], 7, 0, 6.3); ctx.fill(); }
    ctx.fillStyle = CY; ctx.beginPath(); ctx.arc(50, 340, 8, 0, 6.3); ctx.fill(); txt(ctx, "A", 62, 340, { bold: true });
    ctx.fillStyle = AM; ctx.beginPath(); ctx.arc(440, 60, 8, 0, 6.3); ctx.fill(); txt(ctx, "B", 428, 60, { bold: true });
    card(ctx, 462, 14, 168, 372, "SAFE ROUTE FINDER");
    if (t > 1) { txt(ctx, "FASTEST", 476, 58, { size: 10, c: MU }); txt(ctx, "16 min", 476, 76, { size: 14, bold: true }); txt(ctx, "Safety score 54", 476, 96, { size: 11, c: RD }); meter(ctx, 476, 108, 140, 0.54, RD, 6); }
    if (t > 4) { txt(ctx, "SAFEST ✔", 476, 160, { size: 10, c: MU }); txt(ctx, "19 min", 476, 178, { size: 14, bold: true }); txt(ctx, "Safety score 92", 476, 198, { size: 11, c: GR }); meter(ctx, 476, 210, 140, 0.92, GR, 6); }
    if (t > 7.2) { txt(ctx, "Avoids 2 risk zones", 476, 262, { size: 11, c: CY }); txt(ctx, "+ rain & dark roads", 476, 280, { size: 11, c: CY }); }
    if (t > 7.2) tag(ctx, "FOLLOWING SAFEST", 546, 340, GR);
    st.speed = 0; void p;
  },

  "predictive-vehicle-maintenance": (ctx, t, st) => {
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, W, H);
    const k = t / LOOP;
    const h = { Brakes: 100 - 82 * k, Tyres: 100 - 48 * k, Battery: 100 - 34 * k, Engine: 100 - 22 * k };
    const colr = (v) => (v < 30 ? RD : v < 60 ? AM : GR);
    ctx.fillStyle = "#1e293b"; rr(ctx, 150, 50, 140, 300, 40); ctx.fill();
    [[140, 100], [300, 100], [140, 280], [300, 280]].forEach(([x, y]) => { ctx.fillStyle = colr(h.Tyres); rr(ctx, x - 8, y - 26, 16, 52, 5); ctx.fill(); });
    [[165, 100], [275, 100]].forEach(([x, y]) => { ctx.strokeStyle = colr(h.Brakes); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.3); ctx.stroke(); });
    ctx.fillStyle = colr(h.Engine); rr(ctx, 185, 70, 70, 50, 8); ctx.fill(); txt(ctx, "ENGINE", 220, 95, { size: 10, bold: true, c: "#0f172a", align: "center" });
    ctx.fillStyle = colr(h.Battery); rr(ctx, 190, 290, 60, 30, 6); ctx.fill(); txt(ctx, "BATTERY", 220, 305, { size: 9, bold: true, c: "#0f172a", align: "center" });
    txt(ctx, "TOP VIEW – LIVE PART HEALTH", 220, 28, { size: 10, bold: true, c: CY, align: "center" });
    card(ctx, 462, 14, 168, 372, "PREDICTIVE MAINTENANCE");
    Object.entries(h).forEach(([n, v], i) => {
      const y = 56 + i * 56;
      txt(ctx, n.toUpperCase(), 476, y, { size: 10, c: MU }); txt(ctx, Math.round(v) + "%", 616, y, { size: 12, bold: true, c: colr(v), align: "right" });
      meter(ctx, 476, y + 12, 140, v / 100, colr(v), 7);
    });
    txt(ctx, "TIMELINE: DAY " + Math.round(k * 90), 476, 292, { size: 10, c: MU });
    if (h.Brakes < 40) tag(ctx, "BRAKE PADS: SERVICE IN 12 DAYS", 546, 330, RD);
    else if (h.Brakes < 65) tag(ctx, "WEAR TREND DETECTED", 546, 330, AM);
    else tag(ctx, "ALL SYSTEMS HEALTHY", 546, 330, GR);
    st.speed = 0;
  },

  "air-quality-cabin-monitor": (ctx, t, st) => {
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, W, H);
    const co2 = t < 6 ? lerp(450, 1900, sm(t, 0, 6)) : lerp(1900, 520, sm(t, 6.5, 11));
    const pm = t < 6 ? lerp(12, 85, sm(t, 0, 6)) : lerp(85, 9, sm(t, 6.5, 11));
    ctx.strokeStyle = CY; ctx.lineWidth = 3; rr(ctx, 120, 40, 200, 320, 60); ctx.stroke();
    [[165, 130], [275, 130], [165, 270], [275, 270]].forEach(([x, y]) => { ctx.fillStyle = "#1e293b"; rr(ctx, x - 24, y - 30, 48, 60, 10); ctx.fill(); });
    const fresh = t > 6.3;
    for (let i = 0; i < 40; i++) {
      const a = i * 2.399, r = 30 + (i * 13) % 100;
      let x = 220 + Math.cos(a + t * 0.5 * (i % 3 ? 1 : -1)) * r * 0.9, y = 200 + Math.sin(a * 1.3 + t * 0.6) * r * 1.3;
      if (fresh) { const k = sm(t, 6.3, 10); x = lerp(x, i % 2 ? 110 : 330, k); y = lerp(y, 30 + (i % 5) * 80, k); }
      ctx.fillStyle = `rgba(251,191,36,${0.25 + 0.5 * clamp(pm / 85)})`; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 6.3); ctx.fill();
    }
    if (fresh) { ctx.strokeStyle = GR; ctx.lineWidth = 3; [[100, 60], [340, 60], [100, 340], [340, 340]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (x < 200 ? 18 : -18), y); ctx.stroke(); }); }
    const cc = co2 > 1200 ? RD : co2 > 800 ? AM : GR;
    side(ctx, "CABIN AIR MONITOR", [
      { k: "CO₂", v: Math.round(co2) + " ppm", c: cc, m: co2 / 2000 },
      { k: "PM2.5 DUST", v: Math.round(pm) + " µg/m³", c: pm > 50 ? RD : pm > 25 ? AM : GR, m: pm / 100 },
      { k: "CABIN TEMP", v: "27°C", c: "#e2e8f0" },
      { k: "AI ACTION", v: fresh ? "FRESH AIR + FILTER" : co2 > 1200 ? "Switching…" : "Recirculating", c: fresh ? GR : AM },
    ]);
    if (co2 > 1200 && t < 6.3) tag(ctx, "HIGH CO₂ – DROWSINESS RISK", 220, 385, RD);
    st.speed = 0;
  },

  "unified-safety-dashboard": (ctx, t, st) => {
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, W, H);
    const driverBad = t > 3 && t < 6.5, roadBad = t > 6.5 && t < 9.5, vehBad = t > 9.5;
    const mods = [["Road risk", roadBad ? AM : GR], ["Driver", driverBad ? RD : GR], ["Vehicle", vehBad ? AM : GR], ["Cabin air", GR], ["Traffic", GR], ["Weather", GR]];
    const score = Math.round(92 - (driverBad ? 21 : 0) - (roadBad ? 14 : 0) - (vehBad ? 9 : 0));
    const sc = score > 80 ? GR : score > 65 ? AM : RD;
    ctx.strokeStyle = "rgba(148,163,184,.2)"; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(230, 190, 100, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
    ctx.strokeStyle = sc; ctx.beginPath(); ctx.arc(230, 190, 100, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * score / 100)); ctx.stroke();
    txt(ctx, String(score), 230, 185, { size: 54, bold: true, c: sc, align: "center" });
    txt(ctx, "SAFETY SCORE", 230, 228, { size: 11, c: MU, align: "center" });
    mods.forEach(([n, c], i) => { const x = 30 + (i % 3) * 140, y = 320 + Math.floor(i / 3) * 34; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 8, y, 5, 0, 6.3); ctx.fill(); txt(ctx, n, x + 20, y, { size: 11 }); });
    const msg = driverBad ? ["Driver fatigue detected", "Take a break soon", RD] : roadBad ? ["Wet road ahead", "Speed reduced to 50", AM] : vehBad ? ["Brake pads at 30%", "Book a service", AM] : ["All systems safe", "Drive well", GR];
    card(ctx, 462, 14, 168, 372, "UNIFIED DASHBOARD");
    txt(ctx, "TOP PRIORITY", 476, 58, { size: 10, c: MU });
    txt(ctx, msg[0], 476, 80, { size: 13, bold: true, c: msg[2] });
    txt(ctx, msg[1], 476, 100, { size: 11, c: "#e2e8f0" });
    mods.forEach(([n, c], i) => { const y = 150 + i * 32; txt(ctx, n, 476, y, { size: 11, c: MU }); txt(ctx, c === GR ? "OK" : c === AM ? "WARN" : "ALERT", 616, y, { size: 11, bold: true, c, align: "right" }); });
    st.speed = 0;
  },

  "future-accident-simulator": (ctx, t, st) => {
    st.speed = 0.5;
    road(ctx, st);
    car(ctx, L2, 130, "#64748b", { brake: true, hazard: true, t });
    const k = sm(t, 7, 10.5);
    const ex = lerp(L2, L1, k), ey = lerp(EY, 200, k);
    const n = Math.min(9, Math.floor(t * 2.2));
    for (let i = 0; i < n; i++) {
      const endX = lerp(130, 440, i / 8), hit = Math.abs(endX - L2) < 40;
      const chosen = i === 1 && t > 6;
      ctx.strokeStyle = chosen ? GR : hit ? "rgba(248,113,113,.7)" : "rgba(148,163,184,.4)";
      ctx.lineWidth = chosen ? 4 : 2;
      ctx.beginPath(); ctx.moveTo(L2, EY - 30); ctx.bezierCurveTo(L2, 230, endX, 200, endX, 70); ctx.stroke();
      if (hit && t > 3) { ctx.fillStyle = RD; ctx.beginPath(); ctx.arc(endX, 100, 4, 0, 6.3); ctx.fill(); }
    }
    car(ctx, ex, ey, "#38bdf8");
    if (t > 1 && t < 6.5) tag(ctx, "SIMULATING " + Math.round(clamp(t / 5) * 128) + " FUTURES", 320, 36, CY);
    if (t > 6.5) tag(ctx, "SAFE PATH CHOSEN", 320, 36, GR);
    side(ctx, "FUTURE SIMULATOR", [
      { k: "SCENARIOS RUN", v: String(Math.round(clamp(t / 5) * 128)), c: CY },
      { k: "CRASH FUTURES", v: t > 3 ? "5 of 9 paths" : "scanning", c: t > 3 ? RD : MU },
      { k: "SAFEST ACTION", v: t > 6 ? "Lane change + brake" : "computing…", c: t > 6 ? GR : AM },
      { k: "HORIZON", v: "5 seconds", c: "#e2e8f0" },
    ]);
  },

  "vehicle-intention-predictor": (ctx, t, st) => {
    st.speed = 1 - 0.35 * sm(t, 5, 7);
    road(ctx, st);
    const ox = L1 + 8 * sm(t, 1.5, 4) + 120 * sm(t, 5, 8.2);
    const ex = L2 + 22 * sm(t, 5.2, 7);
    car(ctx, ox, 225, "#f97316", { rot: 0.12 * sm(t, 5, 6.5) });
    car(ctx, ex, EY, "#38bdf8", { brake: t > 6 && t < 8 });
    const p = clamp(0.1 + 0.8 * sm(t, 2.5, 6));
    if (p > 0.3) {
      ctx.strokeStyle = AM; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
      ctx.beginPath(); ctx.moveTo(ox, 195); ctx.quadraticCurveTo(ox + 40, 160, L2 - 15, 130); ctx.stroke(); ctx.setLineDash([]);
      tag(ctx, "CUT-IN " + Math.round(p * 100) + "%", ox, 160, p > 0.6 ? RD : AM);
    }
    side(ctx, "INTENTION PREDICTOR", [
      { k: "TRACKED CAR", v: "Orange, left lane", c: "#e2e8f0" },
      { k: "SIGNALS", v: t > 1.5 ? "Drifting, no indicator" : "Normal", c: t > 1.5 ? AM : GR },
      { k: "PREDICTED MOVE", v: p > 0.5 ? "Cut-in" : "Keep lane", c: p > 0.5 ? RD : GR, m: p },
      { k: "ACTION", v: t > 5 ? "Ease off, make room" : "Monitor", c: CY },
    ]);
  },

  "invisible-road-hazard-detector": (ctx, t, st) => {
    st.speed = 1 - 0.55 * sm(t, 4.5, 6.5);
    road(ctx, st, { road: "#1b2538" });
    const iy = wy(st, 650), oy = wy(st, 1000);
    const g = ctx.createLinearGradient(0, 0, 0, EY - 30);
    g.addColorStop(0, "rgba(226,232,240,.92)"); g.addColorStop(0.7, "rgba(226,232,240,.35)"); g.addColorStop(1, "rgba(226,232,240,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, EY - 30);
    car(ctx, L2, EY, "#38bdf8");
    const sweep = -Math.PI / 2 + 0.6 * Math.sin(t * 2.2);
    ctx.strokeStyle = "rgba(34,211,238,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L2, EY - 30); ctx.lineTo(L2 + Math.cos(sweep) * 300, EY - 30 + Math.sin(sweep) * 300); ctx.stroke();
    const reveal = (y, x, label, col, rx, ry) => {
      const d = EY - 30 - y;
      if (y > -20 && d < 330) {
        ctx.fillStyle = col + "55"; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.3); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
        if (d > 0) tag(ctx, label + " " + Math.round(d / 6) + " m", x, Math.max(24, y - 30), col);
      }
    };
    reveal(iy, L2, "BLACK ICE", "#38bdf8", 52, 26);
    reveal(oy, L1, "OIL PATCH", "#fbbf24", 36, 18);
    const near = EY - 30 - iy < 260 && iy < EY;
    side(ctx, "HIDDEN HAZARD DETECTOR", [
      { k: "VISIBILITY", v: "FOG – 25 m", c: MU },
      { k: "SENSORS", v: "Radar + Thermal", c: GR },
      { k: "FOUND", v: iy > 0 && iy < EY ? "Black ice, oil" : "scanning…", c: AM },
      { k: "ACTION", v: near ? "Slowing, grip control" : "Monitoring", c: near ? RD : CY },
    ]);
  },
};

export function render(ctx, slug, t, st) {
  ctx.clearRect(0, 0, W, H);
  const fn = SCENES[slug];
  if (fn) fn(ctx, t, st);
  txt(ctx, "● NEXORA AI • REFERENCE SIMULATION", 14, H - 12, { size: 9, bold: true, c: "rgba(148,163,184,.8)" });
}
