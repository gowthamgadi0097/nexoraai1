import { redirect } from "next/navigation";
import DashboardPanel from "@/components/DashboardPanel";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | NEXORA AI" };

export default function Dashboard() {
  const s = getSession();
  if (!s) redirect("/login?next=/dashboard");
  return <DashboardPanel name={s.name.split(" ")[0]} />;
}
