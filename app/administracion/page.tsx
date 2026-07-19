import { getAdminIdentity } from "../admin-auth";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLogin } from "./AdminLogin";

export const dynamic = "force-dynamic";

export default async function AdministrationPage() {
  const identity = await getAdminIdentity();

  if (!identity) {
    return <AdminLogin />;
  }

  return <AdminDashboard initialIdentity={identity} signOutPath="/api/admin/session" />;
}
