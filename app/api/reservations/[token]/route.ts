import { and, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookings } from "../../../../db/schema";
import { OPENING_DATE, SLOTS, getSlotsForDay, isProfessional, isProfessionalScheduledForSlot } from "../../../clinic-config";
import { getEligibleProfessionals } from "../../../treatment-service";

type RouteContext = { params: Promise<{ token: string }> };

function publicBooking(row: typeof bookings.$inferSelect) {
  return {
    confirmationCode: row.confirmationCode,
    treatmentId: row.treatmentId,
    treatmentName: row.treatmentName,
    professional: row.professional,
    date: row.appointmentDate,
    time: row.appointmentTime,
    patientName: row.patientName,
    status: row.status,
  };
}

async function findBooking(token: string) {
  if (token.length < 40) return undefined;
  const [booking] = await getDb().select().from(bookings).where(eq(bookings.managementToken, token)).limit(1);
  return booking;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const booking = await findBooking(token);
  if (!booking) return Response.json({ error: "Reserva no encontrada." }, { status: 404 });
  return Response.json({ booking: publicBooking(booking) });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { token } = await params;
  const current = await findBooking(token);
  if (!current) return Response.json({ error: "Reserva no encontrada." }, { status: 404 });

  const payload = (await request.json()) as { action?: string; date?: string; time?: string; professional?: string };
  const db = getDb();

  if (payload.action === "cancel") {
    const [updated] = await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, current.id)).returning();
    return Response.json({ booking: publicBooking(updated) });
  }

  if (payload.action !== "reschedule") return Response.json({ error: "Acción no válida." }, { status: 400 });

  const date = payload.date?.trim() ?? "";
  const time = payload.time?.trim() ?? "";
  const requestedProfessional = payload.professional?.trim() ?? "";
  const day = new Date(`${date}T12:00:00`).getDay();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || day === 0) {
    return Response.json({ error: "La fecha seleccionada no está disponible." }, { status: 400 });
  }
  if (date < OPENING_DATE) return Response.json({ error: "La agenda BIOBELLE comienza el 18 de agosto de 2026." }, { status: 400 });
  const validSlots = getSlotsForDay(day);
  if (!validSlots.includes(time)) return Response.json({ error: "La hora seleccionada no está disponible." }, { status: 400 });

  const eligible = await getEligibleProfessionals(db, current.treatmentId);
  const candidates = isProfessional(requestedProfessional) && eligible.includes(requestedProfessional)
    ? [requestedProfessional]
    : eligible;
  if (!candidates.length) return Response.json({ error: "Este tratamiento aún no tiene profesional asignada." }, { status: 400 });
  const occupied = await db
    .select({ professional: bookings.professional })
    .from(bookings)
    .where(and(
      ne(bookings.id, current.id),
      eq(bookings.appointmentDate, date),
      eq(bookings.appointmentTime, time),
      inArray(bookings.professional, candidates),
      inArray(bookings.status, ["pending", "confirmed"]),
    ));
  const occupiedProfessionals = new Set(occupied.map((row) => row.professional));
  const available = candidates.filter((candidate) => {
    const isScheduled = isProfessionalScheduledForSlot(candidate, day, time);
    return isScheduled && !occupiedProfessionals.has(candidate);
  });

  for (const professional of available) {
    try {
      const [updated] = await db.update(bookings).set({
        appointmentDate: date,
        appointmentTime: time,
        professional,
        status: "pending",
      }).where(eq(bookings.id, current.id)).returning();
      return Response.json({ booking: publicBooking(updated) });
    } catch (error) {
      if (!(error instanceof Error) || !/unique|constraint/i.test(`${error.message} ${error.cause ?? ""}`)) throw error;
    }
  }

  return Response.json({ error: "Esa hora acaba de ocuparse. Elige otra disponible." }, { status: 409 });
}
