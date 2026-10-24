"use client";
export default function Error({ error, reset }) {
  return (
    <main className="wrap" style={{ padding: "80px 0", textAlign: "center" }}>
      <h2>Something went wrong on this page</h2>
      <p style={{ color: "#94a3b8", margin: "12px 0 20px" }}>{String(error?.message || "Unknown error")}</p>
      <button className="btn pri" onClick={() => reset()}>Try again</button>
    </main>
  );
}
