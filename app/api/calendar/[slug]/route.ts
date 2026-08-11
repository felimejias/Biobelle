import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookings } from "../../../../db/schema";
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
    const rows = await db
      .select()
      .from(bookings)
      .where(and(
        eq(bookings.professional, matchedProfessional),
        inArray(bookings.status, ["pending", "confirmed", "completed"])
      ));

    const eventsIcs = rows.map((row) => {
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
    }).join("\r\n");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BIOBELLE Centro Medico Estetico//Agenda Sync//ES",
      `X-WR-CALNAME:BIOBELLE - Agenda ${matchedProfessional}`,
      "X-WR-TIMEZONE:America/Santiago",
      eventsIcs,
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
