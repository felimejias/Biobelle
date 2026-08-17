export const PROFESSIONALS = ["Kiara Moscoso", "Pía Orellana", "Dr. Luis Moscoso"] as const;
export const WEEKDAY_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

export const SATURDAY_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
] as const;

export const SLOTS = [...WEEKDAY_SLOTS] as const;
export const OPENING_DATE = "2026-08-18";

export function getSlotsForDay(dayOfWeek: number): readonly string[] {
  if (dayOfWeek === 6) return SATURDAY_SLOTS;
  if (dayOfWeek >= 1 && dayOfWeek <= 5) return WEEKDAY_SLOTS;
  return [];
}

/**
 * Matriz de turnos y disponibilidad base por profesional:
 * - Lunes a Jueves: AM (09:00 a 14:50) solo Kiara | PM (15:00 a 18:50) solo Pía
 * - Viernes: AM (09:00 a 13:50) solo Pía | PM (14:00 a 18:50) Kiara y Pía
 * - Sábado: 09:00 a 12:50 Kiara y Pía
 * - Domingo: cerrado
 *
 * * Dr. Luis Moscoso mantiene disponibilidad para sus consultas clínicas/médicas.
 */
export function isProfessionalScheduledForSlot(
  professional: string,
  dayOfWeek: number,
  time: string,
): boolean {
  // Lunes a Jueves (1, 2, 3, 4)
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    const amSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
    const pmSlots = ["15:00", "16:00", "17:00", "18:00"];

    if (amSlots.includes(time)) {
      if (professional === "Kiara Moscoso") return true;
      if (professional === "Pía Orellana") return false;
      return true; // Dr. Luis Moscoso
    }
    if (pmSlots.includes(time)) {
      if (professional === "Kiara Moscoso") return false;
      if (professional === "Pía Orellana") return true;
      return true; // Dr. Luis Moscoso
    }
    return false;
  }

  // Viernes (5)
  if (dayOfWeek === 5) {
    const fridayAmSlots = ["09:00", "10:00", "11:00", "12:00", "13:00"];
    const fridayPmSlots = ["14:00", "15:00", "16:00", "17:00", "18:00"];

    if (fridayAmSlots.includes(time)) {
      if (professional === "Kiara Moscoso") return false;
      if (professional === "Pía Orellana") return true;
      return true; // Dr. Luis Moscoso
    }
    if (fridayPmSlots.includes(time)) {
      return true; // Ambas Kiara y Pía
    }
    return false;
  }

  // Sábado (6)
  if (dayOfWeek === 6) {
    const saturdaySlots = ["09:00", "10:00", "11:00", "12:00"];
    if (saturdaySlots.includes(time)) {
      return true; // Ambas Kiara y Pía
    }
    return false;
  }

  // Domingo o fuera de horario
  return false;
}

export type ProfessionalName = typeof PROFESSIONALS[number];

export const PROFESSIONAL_EMAILS: Record<ProfessionalName, string> = {
  "Kiara Moscoso": "kiaramoscoso77@gmail.com",
  "Pía Orellana": "piaorellana96@gmail.com",
  "Dr. Luis Moscoso": "consulta@biobelle.cl",
};

export type ClinicTreatment = {
  id: string;
  label: string;
  publicLabel: string;
  duration: string;
  price: string;
  active: boolean;
  sortOrder: number;
  professionals: ProfessionalName[];
};

export const DEFAULT_TREATMENTS: ClinicTreatment[] = [
  { id: "evaluacion", label: "Orientación y evaluación profesional", publicLabel: "Evaluación profesional", duration: "40 min", price: "Sin compromiso", active: true, sortOrder: 10, professionals: [...PROFESSIONALS] },
  { id: "armonizacion", label: "Armonización facial", publicLabel: "Armonización facial", duration: "45–60 min", price: "Evaluación previa", active: true, sortOrder: 20, professionals: [...PROFESSIONALS] },
  { id: "piel", label: "Dermoestética", publicLabel: "Dermoestética", duration: "60–75 min", price: "Según evaluación", active: true, sortOrder: 30, professionals: [...PROFESSIONALS] },
  { id: "laser", label: "Tecnología láser Nd Yag Q Switched", publicLabel: "Tecnología láser Nd Yag Q Switched", duration: "30–60 min", price: "Según evaluación", active: true, sortOrder: 40, professionals: [...PROFESSIONALS] },
  { id: "regenerativa", label: "Medicina regenerativa", publicLabel: "Medicina regenerativa", duration: "60 min", price: "Según evaluación", active: true, sortOrder: 50, professionals: [...PROFESSIONALS] },
  { id: "lesiones", label: "Atención Clínica - Lesiones Cutáneas", publicLabel: "Atención Clínica", duration: "30–45 min", price: "Según evaluación", active: true, sortOrder: 60, professionals: ["Kiara Moscoso", "Pía Orellana", "Dr. Luis Moscoso"] },
  { id: "atencion-medica", label: "Atención clínica y Consulta médica", publicLabel: "Atención clínica y Consulta médica", duration: "45–75 min", price: "Plan personalizado", active: true, sortOrder: 70, professionals: ["Dr. Luis Moscoso", "Kiara Moscoso", "Pía Orellana"] },
];

export function treatmentMap(treatments = DEFAULT_TREATMENTS) {
  return Object.fromEntries(treatments.map((item) => [item.id, item.label]));
}

export function eligibleProfessionals(treatmentId: string, treatments = DEFAULT_TREATMENTS) {
  return treatments.find((item) => item.id === treatmentId && item.active)?.professionals ?? [...PROFESSIONALS];
}

export function isProfessional(value: string): value is ProfessionalName {
  return PROFESSIONALS.includes(value as ProfessionalName);
}

export function slugifyTreatment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function getTreatmentDurationMinutes(durationStr?: string): number {
  if (!durationStr) return 60;
  const match = durationStr.match(/(\d+)(?:\s*–\s*(\d+))?/);
  if (!match) return 60;
  return match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10);
}

export function generateCalendarLinks(booking: {
  confirmationCode: string;
  treatmentName: string;
  professional: string;
  date: string;
  time: string;
  duration?: string;
  patientName?: string;
  phone?: string;
}) {
  const proEmail = PROFESSIONAL_EMAILS[booking.professional as ProfessionalName] || "consulta@biobelle.cl";
  const dateFormatted = booking.date.replaceAll("-", "");
  const timeFormatted = booking.time.replaceAll(":", "");
  const startIso = `${dateFormatted}T${timeFormatted}00`;
  
  const durationMin = getTreatmentDurationMinutes(booking.duration);
  const [h, m] = booking.time.split(":").map(Number);
  const totalMinutes = h * 60 + m + durationMin;
  const endH = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const endM = String(totalMinutes % 60).padStart(2, "0");
  const endIso = `${dateFormatted}T${endH}${endM}00`;

  const title = encodeURIComponent(`Cita BIOBELLE: ${booking.treatmentName} - ${booking.professional}`);
  const details = encodeURIComponent(
    `Reserva BIOBELLE (${booking.confirmationCode}).\nTratamiento: ${booking.treatmentName} (Duración estim.: ${durationMin} min)\nProfesional: ${booking.professional} (${proEmail})\nPaciente: ${booking.patientName || "Paciente"}\nContacto: ${booking.phone || ""}\nDirección: Bueras 218, Edificio Olavarría, Oficina 302, Rancagua.`
  );
  const location = encodeURIComponent("Bueras 218, Edificio Olavarría, Oficina 302, Rancagua");

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}&add=${encodeURIComponent(proEmail)}`;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BIOBELLE Centro Medico Estetico//Agenda//ES",
    "BEGIN:VEVENT",
    `SUMMARY:Cita BIOBELLE - ${booking.treatmentName}`,
    `DESCRIPTION:Cita con ${booking.professional} (${proEmail}). Duración: ${durationMin} min. Codigo: ${booking.confirmationCode}.`,
    "LOCATION:Bueras 218, Edificio Olavarría, Oficina 302, Rancagua",
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `ORGANIZER;CN=BIOBELLE:mailto:${proEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${booking.professional}:mailto:${proEmail}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const icsUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsLines.join("\r\n"))}`;

  return { proEmail, googleUrl, icsUrl, durationMin };
}

