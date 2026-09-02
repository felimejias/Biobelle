import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookings, scheduleBlocks } from "../../../../db/schema";
import { PROFESSIONALS } from "../../../clinic-config";

type CalendarRouteProps = { params: Promise<{ slug: string }> };

function escapeIcsText(str: string) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatIcsDate(dateStr: string, timeStr: string) {
  const dateFormatted = dateStr.replaceAll("-", "");
  const timeFormatted = timeStr.replaceAll(":", "");
  const start = `${dateFormatted}T${timeFormatted}00`;
  const [h, m] = timeStr.split(":").map(Number);
  const endH = String(h + 1).padStart(2, "0");
  const end = `${dateFormatted}T${endH}${String(m).padStart(2, "0")}00`;
  return { start, end };
}

function getIcsUtcTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function getVTimeZoneBlock(): string {
  return [
    "BEGIN:VTIMEZONE",
    "TZID:America/Santiago",
    "X-LIC-LOCATION:America/Santiago",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0300",
    "TZOFFSETTO:-0400",
    "TZNAME:-04",
    "DTSTART:19700405T000000",
    "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0300",
    "TZNAME:-03",
    "DTSTART:19700906T000000",
    "RRULE:FREQ=YEARLY;BYMONTH=9;BYDAY=1SU",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
  ].join("\r\n");
}

function getShiftRecurringEvents(professional: string, dtstamp: string): string[] {
  const events: string[] = [];

  if (professional === "Kiara Moscoso") {
    // Lunes a Jueves PM bloqueado (15:00 a 19:00)
    events.push([
      "BEGIN:VEVENT",
      `UID:kiara-shift-mon-thu-pm@biobelle.cl`,
      `DTSTAMP:${dtstamp}`,
      `SUMMARY:Bloqueado (Turno Pía / Fuera de Horario)`,
      `DESCRIPTION:Horario no disponible para atención de Kiara Moscoso.`,
      `LOCATION:Bueras 218\\, Edificio Olavarría\\, Oficina 302\\, Rancagua`,
      `DTSTART;TZID=America/Santiago:20260810T150000`,
      `DTEND;TZID=America/Santiago:20260810T190000`,
      `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH`,
      `STATUS:CONFIRMED`,
      `TRANSP:OPAQUE`,
      `SEQUENCE:0`,
      `END:VEVENT`,
    ].join("\r\n"));

    // Viernes AM bloqueado (09:00 a 14:00)
    events.push([
      "BEGIN:VEVENT",
      `UID:kiara-shift-fri-am@biobelle.cl`,
      `DTSTAMP:${dtstamp}`,
      `SUMMARY:Bloqueado (Turno Pía / Fuera de Horario)`,
      `DESCRIPTION:Horario no disponible para atención de Kiara Moscoso.`,
      `LOCATION:Bueras 218\\, Edificio Olavarría\\, Oficina 302\\, Rancagua`,
      `DTSTART;TZID=America/Santiago:20260814T090000`,
      `DTEND;TZID=America/Santiago:20260814T140000`,
      `RRULE:FREQ=WEEKLY;BYDAY=FR`,
      `STATUS:CONFIRMED`,
      `TRANSP:OPAQUE`,
      `SEQUENCE:0`,
      `END:VEVENT`,
    ].join("\r\n"));
  }

  if (professional === "Pía Orellana") {
    // Lunes a Jueves AM bloqueado (09:00 a 15:00)
    events.push([
      "BEGIN:VEVENT",
      `UID:pia-shift-mon-thu-am@biobelle.cl`,
      `DTSTAMP:${dtstamp}`,
      `SUMMARY:Bloqueado (Turno Kiara / Fuera de Horario)`,
      `DESCRIPTION:Horario no disponible para atención de Pía Orellana.`,
      `LOCATION:Bueras 218\\, Edificio Olavarría\\, Oficina 302\\, Rancagua`,
      `DTSTART;TZID=America/Santiago:20260810T090000`,
      `DTEND;TZID=America/Santiago:20260810T150000`,
      `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH`,
      `STATUS:CONFIRMED`,
      `TRANSP:OPAQUE`,
      `SEQUENCE:0`,
      `END:VEVENT`,
    ].join("\r\n"));
  }

  // Sábado tarde cerrado para ambas (13:00 a 19:00)
  events.push([
    "BEGIN:VEVENT",
    `UID:${professional.toLowerCase().replace(/[^a-z]/g, "")}-sat-pm@biobelle.cl`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:Bloqueado (Centro Cerrado)`,
    `DESCRIPTION:BIOBELLE Centro Médico - Estético cerrado.`,
    `LOCATION:Bueras 218\\, Edificio Olavarría\\, Oficina 302\\, Rancagua`,
    `DTSTART;TZID=America/Santiago:20260815T130000`,
    `DTEND;TZID=America/Santiago:20260815T190000`,
    `RRULE:FREQ=WEEKLY;BYDAY=SA`,
    `STATUS:CONFIRMED`,
    `TRANSP:OPAQUE`,
    `SEQUENCE:0`,
    `END:VEVENT`,
  ].join("\r\n"));

  // Domingo cerrado todo el día
  events.push([
    "BEGIN:VEVENT",
    `UID:${professional.toLowerCase().replace(/[^a-z]/g, "")}-sun@biobelle.cl`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:Bloqueado (Domingo Cerrado)`,
    `DESCRIPTION:BIOBELLE Centro Médico - Estético cerrado.`,
    `LOCATION:Bueras 218\\, Edificio Olavarría\\, Oficina 302\\, Rancagua`,
    `DTSTART;TZID=America/Santiago:20260816T090000`,
    `DTEND;TZID=America/Santiago:20260816T190000`,
    `RRULE:FREQ=WEEKLY;BYDAY=SU`,
    `STATUS:CONFIRMED`,
    `TRANSP:OPAQUE`,
    `SEQUENCE:0`,
    `END:VEVENT`,
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
      else if (cleanSlug.includes("luis")) matchedProfessional = "Dr. Luis Moscoso";
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

    const dtstamp = getIcsUtcTimestamp();

    const bookingEvents = rows.map((row) => {
      const { start, end } = formatIcsDate(row.appointmentDate, row.appointmentTime);
      const summary = escapeIcsText(`Cita BIOBELLE: ${row.treatmentName} - ${row.patientName}`);
      const description = escapeIcsText(`Paciente: ${row.patientName}\nWhatsApp: ${row.phone}\nTratamiento: ${row.treatmentName}\nCódigo: ${row.confirmationCode}`);
      return [
        "BEGIN:VEVENT",
        `UID:${row.id}@biobelle.cl`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:Bueras 218\\, Edificio Olavarría\\, Oficina 302\\, Rancagua`,
        `DTSTART;TZID=America/Santiago:${start}`,
        `DTEND;TZID=America/Santiago:${end}`,
        `STATUS:${row.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`,
        `TRANSP:OPAQUE`,
        `SEQUENCE:0`,
        "END:VEVENT",
      ].join("\r\n");
    });

    const manualBlockEvents = blocks.map((block) => {
      const dateFormatted = block.blockDate.replaceAll("-", "");
      const startFormatted = block.startTime.replaceAll(":", "");
      const endFormatted = block.endTime.replaceAll(":", "");
      const summary = escapeIcsText(`Horario Bloqueado: ${block.reason}`);
      const description = escapeIcsText(`Bloqueo de agenda en BIOBELLE\nMotivo: ${block.reason}`);
      return [
        "BEGIN:VEVENT",
        `UID:block-${block.id}@biobelle.cl`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:Bueras 218\\, Edificio Olavarría\\, Oficina 302\\, Rancagua`,
        `DTSTART;TZID=America/Santiago:${dateFormatted}T${startFormatted}00`,
        `DTEND;TZID=America/Santiago:${dateFormatted}T${endFormatted}00`,
        `STATUS:CONFIRMED`,
        `TRANSP:OPAQUE`,
        `SEQUENCE:0`,
        "END:VEVENT",
      ].join("\r\n");
    });

    const recurringShiftEvents = getShiftRecurringEvents(matchedProfessional, dtstamp);

    const allEvents = [...bookingEvents, ...manualBlockEvents, ...recurringShiftEvents];

    const vtimezone = getVTimeZoneBlock();

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BIOBELLE Centro Medico Estetico//Agenda Sync v2//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:BIOBELLE - Agenda ${matchedProfessional}`,
      "X-WR-TIMEZONE:America/Santiago",
      vtimezone,
      allEvents.join("\r\n"),
      "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `inline; filename="agenda-${cleanSlug}.ics"`,
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("Error al generar calendario", { status: 500 });
  }
}
