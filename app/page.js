import Link from "next/link";
import FeatureGrid from "@/components/FeatureGrid";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function Home() {
  const s = getSession();
  return (
    <main>
      <section className="hero wrap">
        <span className="badge">OPEN INNOVATION • HACKATHON PROJECT</span>
        <h1>The fully <span className="grad">AI-automated car</span> for next-gen roads</h1>
        <p>
          NEXORA AI brings 17 intelligent safety, prediction and comfort features into one car system.
          Pick any feature to see what it does, why cars need it, and watch the AI in action.
        </p>
        <div className="row">
          <Link href={s ? "/dashboard" : "/signup"} className="btn pri">{s ? "Open dashboard" : "Get started"}</Link>
          <Link href="#features" className="btn">Explore features</Link>
        </div>
        <div className="stats">
          <div><b>17</b><span>AI features</span></div>
          <div><b>360°</b><span>Awareness</span></div>
          <div><b>&lt; 0.5 s</b><span>Reaction time</span></div>
          <div><b>0</b><span>Blind spots</span></div>
        </div>
      </section>
      <section id="features" className="sec wrap">
        <h2>All 17 AI features</h2>
        <p className="sub">{s ? "Click a feature to open its explanation and AI demo." : "Log in to open each feature and watch its demo."}</p>
        <FeatureGrid />
      </section>
    </main>
  );
}
