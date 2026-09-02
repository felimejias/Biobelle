import { PROFESSIONAL_EMAILS, type ProfessionalName } from "./clinic-config";

export interface BookingCalendarPayload {
  confirmationCode: string;
  professional: string;
  date: string;
  time: string;
  treatmentName: string;
  patientName: string;
  phone: string;
}

export function buildIcsInvitation(booking: BookingCalendarPayload): string {
  const proEmail = PROFESSIONAL_EMAILS[booking.professional as ProfessionalName] || "consulta@biobelle.cl";
  const dateFormatted = booking.date.replaceAll("-", "");
  const timeFormatted = booking.time.replaceAll(":", "");
  const startIso = `${dateFormatted}T${timeFormatted}00`;
  
  const [h, m] = booking.time.split(":").map(Number);
  const totalMinutes = h * 60 + m + 60; // 60 min default slot
  const endH = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const endM = String(totalMinutes % 60).padStart(2, "0");
  const endIso = `${dateFormatted}T${endH}${endM}00`;

  const nowUtc = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `${booking.confirmationCode.toLowerCase()}@biobelle.cl`;

  const summary = `Cita Bellabel: ${booking.treatmentName} - ${booking.patientName}`;
  const description = `Paciente: ${booking.patientName}\\nWhatsApp: ${booking.phone}\\nTratamiento: ${booking.treatmentName}\\nCódigo de Reserva: ${booking.confirmationCode}\\nProfesional: ${booking.professional}`;
  const location = "Bueras 218\\, Edificio Olavarría\\, Oficina 302\\, Rancagua";

  return [
    "BEGIN:VCALENDAR",
    "PRODID:-//Bellabel Centro Medico Estetico//Agenda Sync v2//ES",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
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
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `DTSTART;TZID=America/Santiago:${startIso}`,
    `DTEND;TZID=America/Santiago:${endIso}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    `ORGANIZER;CN=Bellabel Centro Medico Estetico:mailto:${proEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${booking.professional}:mailto:${proEmail}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function syncBookingToGoogleCalendar(booking: BookingCalendarPayload): Promise<{
  synced: boolean;
  method: "api" | "email" | "feed_only";
  error?: string;
}> {
  const proEmail = PROFESSIONAL_EMAILS[booking.professional as ProfessionalName] || "consulta@biobelle.cl";
  const icsContent = buildIcsInvitation(booking);
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bellabel Agenda <agenda@biobelle.cl>",
          to: [proEmail],
          subject: `📅 Cita Agendada: ${booking.patientName} (${booking.date} ${booking.time})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #271018; max-width: 600px; margin: 0 auto; background: #fffdfa; border: 1px solid #ded0cc; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 13px; font-weight: 800; color: #7e2341; letter-spacing: 0.1em; text-transform: uppercase;">BELLABEL CENTRO MÉDICO - ESTÉTICO</span>
                <h2 style="color: #271018; margin: 8px 0 4px; font-size: 22px;">Nueva Cita en tu Agenda</h2>
                <p style="margin: 0; color: #786568; font-size: 14px;">Se ha confirmado una nueva atención para ti</p>
              </div>

              <div style="background: #fcf8f7; border: 1px solid #ebd8d4; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #786568; width: 120px;"><b>Profesional:</b></td>
                    <td style="padding: 6px 0; color: #271018;">${booking.professional}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #786568;"><b>Paciente:</b></td>
                    <td style="padding: 6px 0; color: #271018; font-weight: 600;">${booking.patientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #786568;"><b>Tratamiento:</b></td>
                    <td style="padding: 6px 0; color: #7e2341; font-weight: 600;">${booking.treatmentName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #786568;"><b>Fecha y Hora:</b></td>
                    <td style="padding: 6px 0; color: #271018; font-weight: 700;">${booking.date.split("-").reverse().join("/")} a las ${booking.time} hrs</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #786568;"><b>WhatsApp:</b></td>
                    <td style="padding: 6px 0;"><a href="https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}" style="color: #128c7e; text-decoration: none; font-weight: 600;">${booking.phone} 💬</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #786568;"><b>Código:</b></td>
                    <td style="padding: 6px 0; color: #786568; font-family: monospace;">${booking.confirmationCode}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 12px; color: #9c8a8d; text-align: center; margin: 20px 0 0;">
                Esta invitación contiene el archivo oficial de calendario (.ics) adjunto para sincronizarse automáticamente con Google Calendar.
              </p>
            </div>
          `,
          attachments: [
            {
              filename: `cita-${booking.confirmationCode}.ics`,
              content: Buffer.from(icsContent).toString("base64"),
              contentType: "text/calendar; method=REQUEST; charset=UTF-8",
            },
          ],
        }),
      });

      if (response.ok) {
        return { synced: true, method: "email" };
      }
    } catch (err) {
      return { synced: false, method: "feed_only", error: String(err) };
    }
  }

  return { synced: true, method: "feed_only" };
}
