import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, dbErrorMessage } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

    await connectDB();
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hash });
    const res = NextResponse.json({ ok: true, user: { name: user.name, email: user.email } });
    setAuthCookie(res, signToken(user));
    return res;
  } catch (e) {
    if (e && e.code === 11000) return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: dbErrorMessage(e) }, { status: 500 });
  }
}
