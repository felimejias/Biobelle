import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { adminUsers } from "../db/schema";
import { getChatGPTUser } from "./chatgpt-auth";

export type AdminIdentity = {
  email: string;
  name: string;
  role: string;
  professional: string | null;
  isGeneralAdmin: boolean;
};

function configuredAdministrators() {
  const runtime = env as unknown as Record<string, unknown>;
  return String(runtime.BIOBELLE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const authenticated = await getChatGPTUser();
  if (!authenticated) return null;
  const email = authenticated.email.toLowerCase();
  const isGeneralAdmin = configuredAdministrators().includes(email);
  if (isGeneralAdmin) return { email, name: authenticated.displayName, role: "general_admin", professional: null, isGeneralAdmin: true };

  const [record] = await getDb().select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (!record?.active) return null;
  return { email, name: record.name, role: record.role, professional: record.professional, isGeneralAdmin: record.role === "general_admin" };
}

export function canEditAgenda(identity: AdminIdentity) {
  return ["general_admin", "location_admin", "receptionist", "professional"].includes(identity.role);
}

export function canManageUsers(identity: AdminIdentity) {
  return identity.isGeneralAdmin;
}
