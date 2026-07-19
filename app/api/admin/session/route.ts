import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminSessions, adminUsers } from "../../../../db/schema";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  hashPassword,
  hashSessionToken,
  normalizeUsername,
} from "../../../admin-auth";

const INITIAL_ADMIN = {
  id: "biobelle-initial-general-admin",
  username: "admin",
  email: "admin@biobelle.local",
  name: "Administrador general",
  role: "general_admin",
  passwordSalt: "biobelle-initial-admin-2026-07-19",
  passwordHash: "bce5c69c5258c5915c414e9a81b8b55fd26ccbc4bfb02ebf1fc87da4baf60fd9",
};

export async function POST(request: Request) {
  await ensureInitialAdmin();

  const payload = await request.json().catch(() => ({})) as Record<string, unknown>;
  const username = normalizeUsername(String(payload.username ?? ""));
  const password = String(payload.password ?? "");

  if (!username || !password) {
    return Response.json({ error: "Ingresa usuario y clave." }, { status: 400 });
  }

  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  if (!user?.active) {
    return Response.json({ error: "Usuario o clave no válidos." }, { status: 401 });
  }

  const passwordHash = await hashPassword(password, user.passwordSalt);
  if (passwordHash !== user.passwordHash) {
    return Response.json({ error: "Usuario o clave no válidos." }, { status: 401 });
  }

  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(adminSessions).values({
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: await hashSessionToken(token),
    createdAt: now,
    expiresAt,
  });

  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": sessionCookie(request, token, ADMIN_SESSION_MAX_AGE_SECONDS) } },
  );
}

export async function GET(request: Request) {
  const token = cookieValue(request, ADMIN_SESSION_COOKIE);
  if (token) {
    await getDb().delete(adminSessions).where(eq(adminSessions.tokenHash, await hashSessionToken(token)));
  }

  return Response.redirect(new URL("/", request.url), {
    headers: { "Set-Cookie": sessionCookie(request, "", 0) },
  });
}

async function ensureInitialAdmin() {
  const db = getDb();
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.username, INITIAL_ADMIN.username)).limit(1);
  if (existing) return;

  await db.insert(adminUsers).values({
    ...INITIAL_ADMIN,
    professional: null,
    active: true,
    createdAt: new Date(),
  });
}

function sessionCookie(request: Request, token: string, maxAge: number) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

function cookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const prefix = `${name}=`;
  const raw = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return raw ? decodeURIComponent(raw.slice(prefix.length)) : null;
}
