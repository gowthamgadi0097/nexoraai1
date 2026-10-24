import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default function Navbar() {
  let s = null;
  try { s = getSession(); } catch { s = null; }
  return (
    <header className="nav">
      <div className="wrap">
        <Link href="/" className="logo">NEXORA<b> AI</b></Link>
        <div className="nav-r">
          <Link href="/#features" className="btn">Features</Link>
          {s ? (
            <>
              <span className="hello">Hi, {s.name.split(" ")[0]}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn">Login</Link>
              <Link href="/signup" className="btn pri">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
