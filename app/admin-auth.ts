import { and, eq, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "../db";
import { adminSessions, adminUsers } from "../db/schema";

export type AdminIdentity = {
  username: string;
  email: string;
  name: string;
  role: string;
  professional: string | null;
  isGeneralAdmin: boolean;
};

export const ADMIN_SESSION_COOKIE = "biobelle_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const tokenHash = await hashSessionToken(token);
  const db = getDb();
  const [session] = await db
    .select()
    .from(adminSessions)
    .where(and(eq(adminSessions.tokenHash, tokenHash), gte(adminSessions.expiresAt, new Date())))
    .limit(1);

  if (!session) return null;

  const [record] = await db.select().from(adminUsers).where(eq(adminUsers.id, session.userId)).limit(1);
  if (!record?.active) return null;

  return {
    username: record.username,
    email: record.username,
    name: record.name,
    role: record.role,
    professional: record.professional,
    isGeneralAdmin: record.role === "general_admin",
  };
}

export function canEditAgenda(identity: AdminIdentity) {
  return ["general_admin", "location_admin", "receptionist", "professional"].includes(identity.role);
}

export function canManageUsers(identity: AdminIdentity) {
  return identity.isGeneralAdmin;
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export async function hashPassword(password: string, salt: string) {
  return sha256Hex(`${salt}:${password}`);
}

export async function hashSessionToken(token: string) {
  return sha256Hex(token);
}

async function getSessionToken() {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") ?? "";
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const prefix = `${ADMIN_SESSION_COOKIE}=`;
  const raw = cookies.find((item) => item.startsWith(prefix));
  return raw ? decodeURIComponent(raw.slice(prefix.length)) : null;
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
