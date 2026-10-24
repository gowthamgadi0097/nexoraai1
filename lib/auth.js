import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE = "nexora_token";

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
}

export function signToken(user) {
  return jwt.sign({ id: String(user._id), name: user.name, email: user.email }, secret(), {
    expiresIn: "7d",
  });
}

export function setAuthCookie(res, token) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res) {
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function getSession() {
  try {
    const token = cookies().get(COOKIE)?.value;
    if (!token) return null;
    return jwt.verify(token, secret());
  } catch {
    return null;
  }
}
