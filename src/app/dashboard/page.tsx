import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/projects";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { SetupNotice } from "@/components/dashboard/SetupNotice";

export default async function DashboardPage() {
  if (!await isAdmin()) redirect("/dashboard/login");
  const store = await getDatabase();
  if (store.storage === "preview") return <SetupNotice database />;
  return <Dashboard initialRecords={await store.list()} storage={store.storage} />;
}
