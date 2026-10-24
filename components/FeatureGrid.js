import Link from "next/link";
import { FEATURES } from "@/lib/features";

export default function FeatureGrid() {
  return (
    <div className="grid">
      {FEATURES.map((f) => (
        <Link key={f.slug} href={`/feature/${f.slug}`} className="fc">
          <span className="no">{String(f.n).padStart(2, "0")}</span>
          <div className="ic">{f.icon}</div>
          <h3>{f.title}</h3>
          <p>{f.tagline}</p>
          <div className="go">Watch AI demo →</div>
        </Link>
      ))}
    </div>
  );
}
