import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign up | NEXORA AI" };

export default function Page() {
  return <Suspense><AuthForm mode="signup" /></Suspense>;
}
