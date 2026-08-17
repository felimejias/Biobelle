import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookings, scheduleBlocks } from "../../../../db/schema";
import { PROFESSIONALS } from "../../../clinic-config";

type CalendarRouteProps = { params: Promise<{ slug: string }> };

function formatIcsDate(dateStr: string, timeStr: string) {
  const dateFormatted = dateStr.replaceAll("-", "");
  const timeFormatted = timeStr.replaceAll(":", "");
  const start = `${dateFormatted}T${timeFormatted}00`;
  const [h, m] = timeStr.split(":").map(Number);
  const endH = String(h + 1).padStart(2, "0");
  const end = `${dateFormatted}T${endH}${String(m).padStart(2, "0")}00`;
  return { start, end };
}

function getShiftRecurringEvents(professional: string): string[] {
  const events: string[] = [];

  if (professional === "Kiara Moscoso") {
    // Lunes a Jueves PM bloqueado (15:00 a 19:00)
    events.push([
      "BEGIN:VEVENT",
      "UID:kiara-shift-mon-thu-pm@biobelle.cl",
      "SUMMARY:Bloqueado (Turno Pía / Fuera de Horario)",
      "DESCRIPTION:Horario no disponible para atención de Kiara Moscoso.",
      "LOCATION:Bueras 218, Edificio Olavarría, Oficina 302, Rancagua",
      "DTSTART:20260810T150000",
      "DTEND:20260810T190000",
      "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ].join("\r\n"));

    // Viernes AM bloqueado (09:00 a 14:00)
    events.push([
      "BEGIN:VEVENT",
      "UID:kiara-shift-fri-am@biobelle.cl",
      "SUMMARY:Bloqueado (Turno Pía / Fuera de Horario)",
      "DESCRIPTION:Horario no disponible para atención de Kiara Moscoso.",
      "LOCATION:Bueras 218, Edificio Olavarría, Oficina 302, Rancagua",
      "DTSTART:20260814T090000",
      "DTEND:20260814T140000",
      "RRULE:FREQ=WEEKLY;BYDAY=FR",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ].join("\r\n"));
  }

  if (professional === "Pía Orellana") {
    // Lunes a Jueves AM bloqueado (09:00 a 15:00)
    events.push([
      "BEGIN:VEVENT",
      "UID:pia-shift-mon-thu-am@biobelle.cl",
      "SUMMARY:Bloqueado (Turno Kiara / Fuera de Horario)",
      "DESCRIPTION:Horario no disponible para atención de Pía Orellana.",
      "LOCATION:Bueras 218, Edificio Olavarría, Oficina 302, Rancagua",
      "DTSTART:20260810T090000",
      "DTEND:20260810T150000",
      "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ].join("\r\n"));
  }

  // Sábado tarde cerrado para ambas (13:00 a 19:00)
  events.push([
    "BEGIN:VEVENT",
    `UID:${professional.toLowerCase().replace(/[^a-z]/g, "")}-sat-pm@biobelle.cl`,
    "SUMMARY:Bloqueado (Centro Cerrado)",
    "DESCRIPTION:BIOBELLE Centro Médico - Estético cerrado.",
    "LOCATION:Bueras 218, Edificio Olavarría, Oficina 302, Rancagua",
    "DTSTART:20260815T130000",
    "DTEND:20260815T190000",
    "RRULE:FREQ=WEEKLY;BYDAY=SA",
    "STATUS:CONFIRMED",
    "END:VEVENT",
  ].join("\r\n"));

  // Domingo cerrado todo el día
  events.push([
    "BEGIN:VEVENT",
    `UID:${professional.toLowerCase().replace(/[^a-z]/g, "")}-sun@biobelle.cl`,
    "SUMMARY:Bloqueado (Domingo Cerrado)",
    "DESCRIPTION:BIOBELLE Centro Médico - Estético cerrado.",
    "LOCATION:Bueras 218, Edificio Olavarría, Oficina 302, Rancagua",
    "DTSTART:20260816T090000",
    "DTEND:20260816T190000",
    "RRULE:FREQ=WEEKLY;BYDAY=SU",
    "STATUS:CONFIRMED",
    "END:VEVENT",
  ].join("\r\n"));

  return events;
}

export async function GET(_request: Request, { params }: CalendarRouteProps) {
  try {
    const { slug } = await params;
    const cleanSlug = slug.replace(/\.ics$/i, "").toLowerCase();

    let matchedProfessional = PROFESSIONALS.find((pro) =>
      pro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(cleanSlug) ||
      cleanSlug.includes(pro.toLowerCase().split(" ")[0])
    );

    if (!matchedProfessional) {
      if (cleanSlug.includes("pia")) matchedProfessional = "Pía Orellana";
      else if (cleanSlug.includes("kiara")) matchedProfessional = "Kiara Moscoso";
    }

    if (!matchedProfessional) {
      return new Response("Calendario no encontrado", { status: 404 });
    }

    const db = getDb();
    const [rows, blocks] = await Promise.all([
      db.select().from(bookings).where(and(
        eq(bookings.professional, matchedProfessional),
        inArray(bookings.status, ["pending", "confirmed", "completed"])
      )),
      db.select().from(scheduleBlocks).where(eq(scheduleBlocks.professional, matchedProfessional)),
    ]);

    const bookingEvents = rows.map((row) => {
      const { start, end } = formatIcsDate(row.appointmentDate, row.appointmentTime);
      return [
        "BEGIN:VEVENT",
        `UID:${row.id}@biobelle.cl`,
        `SUMMARY:Cita BIOBELLE: ${row.treatmentName} - ${row.patientName}`,
        `DESCRIPTION:Paciente: ${row.patientName}\\nWhatsApp: ${row.phone}\\nTratamiento: ${row.treatmentName}\\nCódigo: ${row.confirmationCode}`,
        "LOCATION:Bueras 218, Edificio Olavarría, Oficina 302, Rancagua",
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `STATUS:${row.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`,
        "END:VEVENT",
      ].join("\r\n");
    });

    const manualBlockEvents = blocks.map((block) => {
      const dateFormatted = block.blockDate.replaceAll("-", "");
      const startFormatted = block.startTime.replaceAll(":", "");
      const endFormatted = block.endTime.replaceAll(":", "");
      return [
        "BEGIN:VEVENT",
        `UID:block-${block.id}@biobelle.cl`,
        `SUMMARY:Horario Bloqueado: ${block.reason}`,
        `DESCRIPTION:Bloqueo de agenda en BIOBELLE\\nMotivo: ${block.reason}`,
        "LOCATION:Bueras 218, Edificio Olavarría, Oficina 302, Rancagua",
        `DTSTART:${dateFormatted}T${startFormatted}00`,
        `DTEND:${dateFormatted}T${endFormatted}00`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
      ].join("\r\n");
    });

    const recurringShiftEvents = getShiftRecurringEvents(matchedProfessional);

    const allEvents = [...bookingEvents, ...manualBlockEvents, ...recurringShiftEvents];

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BIOBELLE Centro Medico Estetico//Agenda Sync//ES",
      `X-WR-CALNAME:BIOBELLE - Agenda ${matchedProfessional}`,
      "X-WR-TIMEZONE:America/Santiago",
      allEvents.join("\r\n"),
      "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return new Response("Error al generar calendario", { status: 500 });
  }
}
