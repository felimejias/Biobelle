import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookings, scheduleBlocks } from "../../../db/schema";
import { OPENING_DATE, SLOTS, getSlotsForDay, isProfessional } from "../../clinic-config";
import { getEligibleProfessionals } from "../../treatment-service";

// Apertura operacional BIOBELLE: 2026-08-10.
function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const treatmentId = url.searchParams.get("treatmentId") ?? "evaluacion";
  const requestedProfessional = url.searchParams.get("professional") ?? "";

  if (!isValidDate(date)) {
    return Response.json({ error: "Selecciona una fecha válida." }, { status: 400 });
  }

  if (date < OPENING_DATE) {
    return Response.json({ date, slots: [], closed: true, beforeOpening: true, message: "La agenda BIOBELLE comienza el 18 de agosto de 2026." });
  }

  const day = new Date(`${date}T12:00:00`).getDay();
  if (day === 0) {
    return Response.json({ date, slots: [], closed: true });
  }

  const daySlots = getSlotsForDay(day);

  const db = getDb();
  const eligible = await getEligibleProfessionals(db, treatmentId);
  const professionals = isProfessional(requestedProfessional) && eligible.includes(requestedProfessional)
    ? [requestedProfessional]
    : eligible;

  if (!professionals.length) {
    return Response.json({ date, slots: [], closed: true, message: "Este tratamiento aún no tiene profesional asignada." });
  }

  const reserved = await db
    .select({ professional: bookings.professional, time: bookings.appointmentTime })
    .from(bookings)
    .where(and(
      eq(bookings.appointmentDate, date),
      inArray(bookings.professional, professionals),
      inArray(bookings.status, ["pending", "confirmed"]),
    ));

  const blocks = await db
    .select({ professional: scheduleBlocks.professional, startTime: scheduleBlocks.startTime, endTime: scheduleBlocks.endTime })
    .from(scheduleBlocks)
    .where(and(
      eq(scheduleBlocks.blockDate, date),
      inArray(scheduleBlocks.professional, professionals),
    ));

  const occupied = new Set(reserved.map((row) => `${row.professional}|${row.time}`));
  const slots = daySlots.map((time) => {
    const availableProfessionals = professionals.filter((professional) => {
      const blocked = blocks.some((block) => block.professional === professional && time >= block.startTime && time < block.endTime);
      return !blocked && !occupied.has(`${professional}|${time}`);
    });
    return { time, available: availableProfessionals.length > 0, availableProfessionals };
  });

  return Response.json({ date, slots, closed: false });
}
