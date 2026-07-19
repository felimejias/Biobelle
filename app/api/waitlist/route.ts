import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { waitlist } from "../../../db/schema";

const TREATMENTS = ["armonizacion", "piel", "laser", "regenerativa", "lesiones", "corporal", "evaluacion"];
const PROFESSIONALS = ["Primera disponible", "Kiara Moscoso", "Pía Orellana"];

function normalizePhone(value: string) {
  return value.replace(/[^+\d]/g, "");
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    name?: string;
    phone?: string;
    treatmentId?: string;
    preferredDate?: string;
    professional?: string;
    privacyConsent?: boolean;
    website?: string;
  };
  if (payload.website) return Response.json({ ok: true }, { status: 201 });

  const name = payload.name?.trim() ?? "";
  const phone = normalizePhone(payload.phone?.trim() ?? "");
  const treatmentId = payload.treatmentId?.trim() ?? "evaluacion";
  const preferredDate = payload.preferredDate?.trim() || null;
  const professional = payload.professional?.trim() ?? "Primera disponible";
  if (name.length < 3 || name.length > 100) return Response.json({ error: "Ingresa tu nombre completo." }, { status: 400 });
  if (phone.length < 10 || phone.length > 16) return Response.json({ error: "Ingresa un WhatsApp válido." }, { status: 400 });
  if (!TREATMENTS.includes(treatmentId)) return Response.json({ error: "Tratamiento no válido." }, { status: 400 });
  if (!PROFESSIONALS.includes(professional)) return Response.json({ error: "Profesional no válida." }, { status: 400 });
  if (payload.privacyConsent !== true) return Response.json({ error: "Debes aceptar el uso de tus datos." }, { status: 400 });

  const db = getDb();
  const existing = await db.select({ id: waitlist.id }).from(waitlist).where(and(
    eq(waitlist.phone, phone),
    eq(waitlist.treatmentId, treatmentId),
    inArray(waitlist.status, ["waiting", "contacted"]),
  )).limit(1);
  if (existing.length) return Response.json({ message: "Ya estás en la lista de espera para este tratamiento." });

  await db.insert(waitlist).values({
    id: crypto.randomUUID(),
    name,
    phone,
    treatmentId,
    preferredDate,
    professional,
    privacyConsent: true,
    status: "waiting",
    createdAt: new Date(),
  });
  return Response.json({ message: "Te agregamos a la lista de espera." }, { status: 201 });
}
