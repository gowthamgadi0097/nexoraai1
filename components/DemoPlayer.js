"use client";
import { useEffect, useRef, useState } from "react";
import { render, W, H, LOOP } from "@/lib/scenes.mjs";

// Shows /public/videos/<slug>.mp4 when it exists, otherwise the live AI simulation.
export default function DemoPlayer({ slug, title }) {
  const canvasRef = useRef(null);
  const barRef = useRef(null);
  const playRef = useRef(true);
  const stRef = useRef({ dist: 0, scroll: 0, speed: 1, tt: 0 });
  const [playing, setPlaying] = useState(true);
  const [video, setVideo] = useState(false);

  useEffect(() => {
    let alive = true;
    setVideo(false);
    fetch(`/videos/${slug}.mp4`, { method: "HEAD" })
      .then((r) => alive && setVideo(r.ok && (r.headers.get("content-type") || "").includes("video")))
      .catch(() => {});
    stRef.current = { dist: 0, scroll: 0, speed: 1, tt: 0 };
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    if (video) return;
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = W * dpr; c.height = H * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    let raf, last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = stRef.current;
      if (playRef.current) {
        st.tt += dt;
        if (st.tt >= LOOP) { st.tt = 0; st.dist = 0; st.scroll = 0; st.speed = 1; }
        st.dist += dt * 120 * st.speed;
        st.scroll += dt * 120 * st.speed;
      }
      render(ctx, slug, st.tt, st);
      if (barRef.current) barRef.current.style.width = (st.tt / LOOP) * 100 + "%";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [slug, video]);

  const toggle = () => { playRef.current = !playRef.current; setPlaying(playRef.current); };
  const restart = () => { stRef.current = { dist: 0, scroll: 0, speed: 1, tt: 0 }; };

  return (
    <div className="player">
      {video ? (
        <video src={`/videos/${slug}.mp4`} controls autoPlay loop muted playsInline className="vid" />
      ) : (
        <>
          <canvas ref={canvasRef} className="vid" aria-label={`${title} AI reference simulation`} />
          <div className="ctrl">
            <button onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚" : "▶"}</button>
            <button onClick={restart} aria-label="Restart">↺</button>
            <div className="track"><div ref={barRef} className="bar" /></div>
            <span className="chip">AI VIDEO</span>
          </div>
        </>
      )}
    </div>
  );
}
