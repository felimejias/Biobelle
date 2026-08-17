import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookings, scheduleBlocks } from "../../../db/schema";
import { OPENING_DATE, PROFESSIONAL_EMAILS, SLOTS, getSlotsForDay, generateCalendarLinks, isProfessional, isProfessionalScheduledForSlot, type ProfessionalName } from "../../clinic-config";
import { formatRut, validateRut } from "../../rut-validator";
import { getTreatmentById } from "../../treatment-service";

// Apertura operacional BIOBELLE: 2026-08-10.
type BookingPayload = {
  concernId?: string;
  treatmentId?: string;
  professional?: string;
  date?: string;
  time?: string;
  name?: string;
  rut?: string;
  isPassport?: boolean;
  phone?: string;
  privacyConsent?: boolean;
  reminderConsent?: boolean;
  website?: string;
};

function normalizePhone(value: string) {
  return value.replace(/[^+\d]/g, "");
}

function confirmationCode() {
  return `BIO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Error && /unique|constraint/i.test(`${error.message} ${error.cause ?? ""}`);
}

async function notifyProfessionalByEmail(booking: {
  confirmationCode: string;
  professional: string;
  date: string;
  time: string;
  treatmentName: string;
  patientName: string;
  phone: string;
}) {
  const proEmail = PROFESSIONAL_EMAILS[booking.professional as ProfessionalName] || "consulta@biobelle.cl";
  const cal = generateCalendarLinks({
    confirmationCode: booking.confirmationCode,
    treatmentName: booking.treatmentName,
    professional: booking.professional,
    date: booking.date,
    time: booking.time,
    patientName: booking.patientName,
    phone: booking.phone,
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { sent: false, proEmail, googleUrl: cal.googleUrl };
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BIOBELLE Agenda <agenda@biobelle.cl>",
        to: [proEmail],
        subject: `Nueva cita agendada: ${booking.patientName} (${booking.date} ${booking.time})`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #271018;">
            <h2 style="color: #7e2341;">Nueva Cita en BIOBELLE</h2>
            <p>Hola <b>${booking.professional}</b>, se ha agendado una nueva atención:</p>
            <ul>
              <li><b>Paciente:</b> ${booking.patientName}</li>
              <li><b>Tratamiento:</b> ${booking.treatmentName}</li>
              <li><b>Fecha:</b> ${booking.date.split("-").reverse().join("/")}</li>
              <li><b>Hora:</b> ${booking.time} hrs</li>
              <li><b>WhatsApp Paciente:</b> ${booking.phone}</li>
              <li><b>Código Reserva:</b> ${booking.confirmationCode}</li>
            </ul>
            <p style="margin-top: 20px;">
              <a href="${cal.googleUrl}" style="background: #7e2341; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Añadir a Google Calendar 📅
              </a>
            </p>
          </div>
        `,
      }),
    });
    return { sent: true, proEmail, googleUrl: cal.googleUrl };
  } catch {
    return { sent: false, proEmail, googleUrl: cal.googleUrl };
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingPayload;
    if (payload.website) return Response.json({ ok: true }, { status: 201 });

    const concernId = payload.concernId?.trim() ?? "orientacion";
    const treatmentId = payload.treatmentId?.trim() ?? "evaluacion";
    const requestedProfessional = payload.professional?.trim() ?? "";
    const date = payload.date?.trim() ?? "";
    const time = payload.time?.trim() ?? "";
    const patientName = payload.name?.trim() ?? "";
    const rawRut = payload.rut?.trim() ?? "";
    const isPassport = Boolean(payload.isPassport);
    const phone = normalizePhone(payload.phone?.trim() ?? "");

    const db = getDb();
    const treatment = await getTreatmentById(db, treatmentId);
    if (!treatment) return Response.json({ error: "Tratamiento no válido." }, { status: 400 });
    const day = new Date(`${date}T12:00:00`).getDay();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || day === 0) {
      return Response.json({ error: "La fecha seleccionada no está disponible." }, { status: 400 });
    }
    if (date < OPENING_DATE) return Response.json({ error: "La agenda BIOBELLE comienza el 18 de agosto de 2026." }, { status: 400 });
    const validSlots = getSlotsForDay(day);
    if (!validSlots.includes(time)) return Response.json({ error: "La hora seleccionada no está disponible." }, { status: 400 });
    if (patientName.length < 3 || patientName.length > 100) return Response.json({ error: "Ingresa tu nombre completo." }, { status: 400 });
    
    let patientRut: string | null = null;
    if (rawRut) {
      if (!isPassport) {
        if (!validateRut(rawRut)) {
          return Response.json({ error: "El RUT ingresado no es válido. Revisa los dígitos o marca la opción de Pasaporte/DNI extranjero." }, { status: 400 });
        }
        patientRut = formatRut(rawRut);
      } else {
        if (rawRut.length < 4 || rawRut.length > 25) {
          return Response.json({ error: "Ingresa un número de pasaporte o DNI válido." }, { status: 400 });
        }
        patientRut = `EXT-${rawRut.toUpperCase()}`;
      }
    }
    
    if (phone.length < 10 || phone.length > 16) return Response.json({ error: "Ingresa un WhatsApp válido." }, { status: 400 });
    if (payload.privacyConsent !== true) return Response.json({ error: "Debes aceptar el uso de tus datos para gestionar la reserva." }, { status: 400 });

    const candidates = isProfessional(requestedProfessional) && treatment.professionals.includes(requestedProfessional)
      ? [requestedProfessional]
      : treatment.professionals;
    if (!candidates.length) return Response.json({ error: "Este tratamiento aún no tiene profesional asignada." }, { status: 400 });
    const occupied = await db
      .select({ professional: bookings.professional })
      .from(bookings)
      .where(and(
        eq(bookings.appointmentDate, date),
        eq(bookings.appointmentTime, time),
        inArray(bookings.professional, candidates),
        inArray(bookings.status, ["pending", "confirmed"]),
      ));
    const occupiedProfessionals = new Set(occupied.map((row) => row.professional));
    const blocks = await db
      .select({ professional: scheduleBlocks.professional, startTime: scheduleBlocks.startTime, endTime: scheduleBlocks.endTime })
      .from(scheduleBlocks)
      .where(and(eq(scheduleBlocks.blockDate, date), inArray(scheduleBlocks.professional, candidates)));
    const availableCandidates = candidates.filter((candidate) => {
      const isScheduled = isProfessionalScheduledForSlot(candidate, day, time);
      if (!isScheduled) return false;
      const blocked = blocks.some((block) => block.professional === candidate && time >= block.startTime && time < block.endTime);
      return !blocked && !occupiedProfessionals.has(candidate);
    });

    const duplicate = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(
        eq(bookings.phone, phone),
        eq(bookings.appointmentDate, date),
        eq(bookings.appointmentTime, time),
        inArray(bookings.status, ["pending", "confirmed"]),
      ))
      .limit(1);
    if (duplicate.length) return Response.json({ error: "Ya existe una reserva activa con este WhatsApp para esa fecha y hora." }, { status: 409 });

    const seed = `${date}-${time}-${treatmentId}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const balancedCandidates = seed % 2 === 0 ? availableCandidates : [...availableCandidates].reverse();

    for (const professional of balancedCandidates) {
      const code = confirmationCode();
      const managementToken = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
      try {
        await db.insert(bookings).values({
          id: crypto.randomUUID(),
          confirmationCode: code,
          managementToken,
          concernId,
          treatmentId,
          treatmentName: treatment.label,
          professional,
          appointmentDate: date,
          appointmentTime: time,
          patientName,
          patientRut,
          phone,
          privacyConsent: true,
          reminderConsent: payload.reminderConsent !== false,
          status: "confirmed",
          createdAt: new Date(),
        });

        void notifyProfessionalByEmail({
          confirmationCode: code,
          professional,
          date,
          time,
          treatmentName: treatment.label,
          patientName,
          phone,
        });

        return Response.json({
          booking: {
            confirmationCode: code,
            professional,
            date,
            time,
            treatmentName: treatment.label,
            managementUrl: `${new URL(request.url).origin}/reserva/${managementToken}`,
          },
        }, { status: 201 });
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
      }
    }

    return Response.json({ error: "Esa hora acaba de ocuparse. Elige otra disponible." }, { status: 409 });
  } catch (error) {
    const message = error instanceof Error && /no such table/i.test(error.message)
      ? "La agenda se está habilitando. Intenta nuevamente en unos minutos."
      : "No pudimos guardar la reserva. Intenta nuevamente.";
    return Response.json({ error: message }, { status: 500 });
  }
}

