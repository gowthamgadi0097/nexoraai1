import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, dbErrorMessage } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password)))
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const res = NextResponse.json({ ok: true, user: { name: user.name, email: user.email } });
    setAuthCookie(res, signToken(user));
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: dbErrorMessage(e) }, { status: 500 });
  }
}
