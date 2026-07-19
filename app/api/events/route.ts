import { getDb } from "../../../db";
import { siteEvents } from "../../../db/schema";

const ALLOWED_EVENTS = new Set(["page_view", "booking_started", "booking_confirmed", "waitlist_joined", "whatsapp_clicked", "treatment_viewed"]);

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { event?: string; path?: string } | null;
  const event = payload?.event?.trim() ?? "";
  const path = payload?.path?.trim().slice(0, 240) ?? "/";
  if (!ALLOWED_EVENTS.has(event) || !path.startsWith("/")) return Response.json({ error: "Evento no válido." }, { status: 400 });
  await getDb().insert(siteEvents).values({ id: crypto.randomUUID(), event, path, createdAt: new Date() });
  return Response.json({ ok: true }, { status: 201 });
}
