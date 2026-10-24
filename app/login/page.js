import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Login | NEXORA AI" };

export default function Page() {
  return <Suspense><AuthForm mode="login" /></Suspense>;
}
