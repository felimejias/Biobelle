import { and, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookings } from "../../../../db/schema";

const PROFESSIONALS = ["Kiara Moscoso", "Pía Orellana"] as const;
const SLOTS = ["09:30", "11:00", "12:30", "15:30", "17:00", "18:30"] as const;

type RouteContext = { params: Promise<{ token: string }> };

function publicBooking(row: typeof bookings.$inferSelect) {
  return {
    confirmationCode: row.confirmationCode,
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
  const requestedProfessional = payload.professional?.trim() ?? "Primera disponible";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(`${date}T12:00:00`).getDay() === 0) {
    return Response.json({ error: "La fecha seleccionada no está disponible." }, { status: 400 });
  }
  if (!SLOTS.includes(time as typeof SLOTS[number])) return Response.json({ error: "La hora seleccionada no está disponible." }, { status: 400 });

  const candidates = PROFESSIONALS.includes(requestedProfessional as typeof PROFESSIONALS[number])
    ? [requestedProfessional]
    : [...PROFESSIONALS];
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
  const available = candidates.filter((candidate) => !occupiedProfessionals.has(candidate));

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
