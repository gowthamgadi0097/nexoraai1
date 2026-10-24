import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { CAMERA } from "@/lib/camera-features";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
const lastCall = new Map();

const fail = (error, status, fatal = false) => NextResponse.json({ error, fatal }, { status });

export async function POST(req) {
  const s = getSession();
  if (!s) return fail("Session expired. Please log in again.", 401, true);
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fail("Server is missing GEMINI_API_KEY (get one at aistudio.google.com/apikey).", 500, true);

  let body;
  try { body = await req.json(); } catch { return fail("Bad request.", 400); }
  const cfg = CAMERA[body.slug];
  if (!cfg) return fail("This feature has no camera analysis.", 400, true);
  if (typeof body.image !== "string" || body.image.length < 100 || body.image.length > 400000)
    return fail("Invalid camera frame.", 400);

  const now = Date.now();
  if (now - (lastCall.get(s.id) || 0) < 700) return fail("Too many frames, slowing down.", 429);
  lastCall.set(s.id, now);

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const generationConfig = { responseMimeType: "application/json", temperature: 0.1 };
  if (model.includes("2.5-flash")) generationConfig.thinkingConfig = { thinkingBudget: 0 }; // faster

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: cfg.prompt }, { inline_data: { mime_type: "image/jpeg", data: body.image } }] }],
        generationConfig,
      }),
    });
    if (!r.ok) {
      if (r.status === 429) return fail("Gemini rate limit reached. Slowing down.", 429);
      if (r.status === 404) return fail(`Gemini model "${model}" not found. Set GEMINI_MODEL.`, 502, true);
      if (r.status === 400 || r.status === 403) return fail("Gemini rejected the request. Check GEMINI_API_KEY.", 502, true);
      return fail("Gemini is unavailable right now.", 502);
    }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    return NextResponse.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch (e) {
    console.error("vision error", e);
    return fail("Could not read the analysis result.", 502);
  }
}
