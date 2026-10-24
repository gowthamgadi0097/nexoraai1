import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectDB, dbErrorMessage } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return NextResponse.json({ error: "Server is missing NEXT_PUBLIC_GOOGLE_CLIENT_ID." }, { status: 500 });
    const { credential } = await req.json();
    if (!credential) return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });

    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: credential, audience: clientId });
    const p = ticket.getPayload();
    if (!p?.email || !p.email_verified) return NextResponse.json({ error: "Google email is not verified." }, { status: 401 });

    await connectDB();
    const email = p.email.toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: p.name || email.split("@")[0], email, googleId: p.sub, picture: p.picture });
    } else if (!user.googleId) {
      user.googleId = p.sub;
      await user.save();
    }
    const res = NextResponse.json({ ok: true, user: { name: user.name, email: user.email } });
    setAuthCookie(res, signToken(user));
    return res;
  } catch (e) {
    console.error(e);
    const bad = /token|audience|signature|Wrong number of segments/i.test(String(e?.message));
    return NextResponse.json({ error: bad ? "Google sign-in failed. Try again." : dbErrorMessage(e) }, { status: bad ? 401 : 500 });
  }
}
