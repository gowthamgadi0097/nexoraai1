import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FEATURES, bySlug } from "@/lib/features";
import { getSession } from "@/lib/auth";
import DemoPlayer from "@/components/DemoPlayer";
import LiveCamera from "@/components/LiveCamera";
import { CAMERA } from "@/lib/camera-features";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }) {
  const f = bySlug(params.slug);
  return { title: f ? `${f.title} | NEXORA AI` : "NEXORA AI" };
}

export default function FeaturePage({ params }) {
  const f = bySlug(params.slug);
  if (!f) notFound();
  const cam = CAMERA[f.slug];
  const s = getSession();
  if (!s) redirect(`/login?next=/feature/${f.slug}`);
  const i = FEATURES.findIndex((x) => x.slug === f.slug);
  const prev = FEATURES[(i + FEATURES.length - 1) % FEATURES.length];
  const next = FEATURES[(i + 1) % FEATURES.length];

  return (
    <main className="wrap">
      <div className="fhead">
        <div className="crumb"><Link href="/dashboard">Dashboard</Link> / Feature {f.n} of {FEATURES.length}</div>
        <h1>{f.icon} {f.title}</h1>
        <p>{f.tagline}</p>
      </div>

      <div className="split">
        <div className="box">
          <h3>WHAT IS IT?</h3>
          <p>{f.what}</p>
          <h3>HOW IT HELPS IN CARS</h3>
          <p>{f.benefit}</p>
          <h3>HOW IT WORKS</h3>
          <ol>{f.how.map((h) => <li key={h}>{h}</li>)}</ol>
          <div className="sgrid">
            {f.stats.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
          </div>
        </div>
        <div className="rcol">
          <DemoPlayer slug={f.slug} title={f.title} />
          {cam ? (
            <LiveCamera slug={f.slug} label={cam.label} gesture={!!cam.gesture} />
          ) : (
            <p className="note">This feature runs on radio, GPS or vehicle data, so it does not use the camera.</p>
          )}
        </div>
      </div>

      <div className="pn">
        <Link href={`/feature/${prev.slug}`} className="btn">← {prev.title}</Link>
        <Link href={`/feature/${next.slug}`} className="btn pri">{next.title} →</Link>
      </div>
      <div className="pills">
        {FEATURES.map((x) => (
          <Link key={x.slug} href={`/feature/${x.slug}`} className={`pill ${x.slug === f.slug ? "on" : ""}`}>{x.n}. {x.title}</Link>
        ))}
      </div>
    </main>
  );
}
