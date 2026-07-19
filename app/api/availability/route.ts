import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookings } from "../../../db/schema";

const PROFESSIONALS = ["Kiara Moscoso", "Pía Orellana"] as const;
const SLOTS = ["09:30", "11:00", "12:30", "15:30", "17:00", "18:30"] as const;
const OPENING_DATE = "2026-08-10";

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const requestedProfessional = url.searchParams.get("professional") ?? "Primera disponible";

  if (!isValidDate(date)) {
    return Response.json({ error: "Selecciona una fecha válida." }, { status: 400 });
  }

  if (date < OPENING_DATE) {
    return Response.json({ date, slots: [], closed: true, beforeOpening: true, message: "La agenda BIOBELLE comienza el 10 de agosto de 2026." });
  }

  const day = new Date(`${date}T12:00:00`).getDay();
  if (day === 0) {
    return Response.json({ date, slots: [], closed: true });
  }

  const professionals = PROFESSIONALS.includes(requestedProfessional as typeof PROFESSIONALS[number])
    ? [requestedProfessional]
    : [...PROFESSIONALS];

  const reserved = await getDb()
    .select({ professional: bookings.professional, time: bookings.appointmentTime })
    .from(bookings)
    .where(and(
      eq(bookings.appointmentDate, date),
      inArray(bookings.professional, professionals),
      inArray(bookings.status, ["pending", "confirmed"]),
    ));

  const occupied = new Set(reserved.map((row) => `${row.professional}|${row.time}`));
  const slots = SLOTS.map((time) => {
    const availableProfessionals = professionals.filter((professional) => !occupied.has(`${professional}|${time}`));
    return { time, available: availableProfessionals.length > 0, availableProfessionals };
  });

  return Response.json({ date, slots, closed: false });
}
