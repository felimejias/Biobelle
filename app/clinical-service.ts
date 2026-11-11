import { eq, desc } from "drizzle-orm";
import type { Db } from "../db";
import { patients, clinicalRecords, postTreatmentFollowups } from "../db/schema";
import { formatRut, validateRut, cleanRut } from "./rut-validator";

export { formatRut, validateRut, cleanRut };

export interface PatientInput {
  rut: string;
  fullName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  medicalAlerts?: string;
}

export async function upsertPatient(db: Db, input: PatientInput) {
  const formattedRut = formatRut(input.rut);
  const now = new Date();

  const [existing] = await db
    .select()
    .from(patients)
    .where(eq(patients.rut, formattedRut))
    .limit(1);

  if (existing) {
    await db
      .update(patients)
      .set({
        fullName: input.fullName || existing.fullName,
        phone: input.phone || existing.phone,
        email: input.email !== undefined ? input.email : existing.email,
        birthDate: input.birthDate !== undefined ? input.birthDate : existing.birthDate,
        medicalAlerts: input.medicalAlerts !== undefined ? input.medicalAlerts : existing.medicalAlerts,
        updatedAt: now,
      })
      .where(eq(patients.rut, formattedRut));
    return { ...existing, ...input, rut: formattedRut, updatedAt: now };
  }

  const newPatient = {
    rut: formattedRut,
    fullName: input.fullName,
    phone: input.phone,
    email: input.email || null,
    birthDate: input.birthDate || null,
    medicalAlerts: input.medicalAlerts || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(patients).values(newPatient);
  return newPatient;
}

export interface ClinicalRecordInput {
  patientRut: string;
  bookingId?: string;
  treatmentId: string;
  treatmentName: string;
  professional: string;
  sessionNumber?: number;
  treatmentZone: string;
  clinicalParameters?: string;
  productsPrescribed?: string;
  nextSessionRecommendedDate?: string;
  observations?: string;
  procedureDate?: string; // YYYY-MM-DD
}

/**
 * Protocolos clínicos dermatológicos de acompañamiento post-tratamiento
 */
export const POST_TREATMENT_SCHEDULE_TEMPLATES: Record<
  string,
  Array<{
    dayOffset: number;
    time: string; // "09:00", "15:00", "21:00"
    type: string;
    textTemplate: (p: { name: string; treatment: string; professional: string; zone: string; product: string }) => string;
  }>
> = {
  // Láser Nd:YAG - Eliminación de Tatuajes
  laser_tatuaje: [
    {
      dayOffset: 0,
      time: "21:00",
      type: "alerta_crema_noche",
      textTemplate: (p) =>
        `Hola ${p.name} 🌸, el equipo de Bellabel te saluda. Recuerda aplicar tu capa fina de ${p.product || "crema regeneradora"} en la zona de ${p.zone} antes de dormir. Mantén la zona fresca y evita fricción. ¿Cómo sientes la piel esta noche?\n1️⃣ Tranquila y sin dolor\n2️⃣ Ardor o calor leve normal\n3️⃣ Molestia persistente (escribirnos)`,
    },
    {
      dayOffset: 1,
      time: "09:30",
      type: "alerta_crema_manana",
      textTemplate: (p) =>
        `¡Buen día ${p.name}! ☀️ Recordatorio Bellabel: Lavar suavemente la zona con agua tibia y jabón neutro, secar con toques suaves y aplicar ${p.product || "tu crema regeneradora"}. Recuerda: CERO sol directo sobre ${p.zone}.`,
    },
    {
      dayOffset: 1,
      time: "16:00",
      type: "alerta_crema_tarde",
      textTemplate: (p) =>
        `Hola ${p.name} ✨ Tu segunda dosis de crema cicatrizante en ${p.zone}. La hidratación de la piel es clave para que los macrófagos eliminen el pigmento.`,
    },
    {
      dayOffset: 3,
      time: "11:00",
      type: "checkin_costras",
      textTemplate: (p) =>
        `Hola ${p.name} 🌸 Han pasado 3 días de tu sesión de láser con ${p.professional}. Si notas formación de pequeñas costritas, es parte del proceso normal de regeneración: ¡por favor no las arranques! Si tienes alguna duda, estamos aquí para ti.`,
    },
    {
      dayOffset: 7,
      time: "12:00",
      type: "evaluacion_semana",
      textTemplate: (p) =>
        `¡Hola ${p.name}! 🌿 Cumplimos 1 semana post-láser en Bellabel. ¿Cómo ves la evolución de tu piel en ${p.zone}? Responde 1 para confirmar que todo va excelente o 2 si deseas que ${p.professional} revise una foto de control.`,
    },
    {
      dayOffset: 10,
      time: "17:00",
      type: "resena_google",
      textTemplate: (p) =>
        `Hola ${p.name} ✨ Esperamos que tu piel se sienta renovada. Tu opinión nos ayuda muchísimo a seguir entregando un servicio con vocación médica y cariño en Rancagua. ¿Nos dejarías tu reseña en Google? ⭐⭐⭐⭐⭐: https://bellabel.cl/opiniones`,
    },
    {
      dayOffset: 42, // 6 semanas
      time: "10:30",
      type: "reagendar_sesion_siguiente",
      textTemplate: (p) =>
        `Hola ${p.name} 🌸 Han pasado 6 semanas desde tu sesión de borrado de tatuaje. Tu piel ya completó el ciclo linfático de eliminación de tinta y está lista para la siguiente sesión. ¿Agendamos tu hora para esta semana con ${p.professional}? Escribe '1' para ver horarios disponibles o pulsa aquí: https://bellabel.cl/#agenda`,
    },
  ],

  // Toxina Botulínica (Bótox)
  botox: [
    {
      dayOffset: 0,
      time: "20:00",
      type: "cuidados_inmediatos_botox",
      textTemplate: (p) =>
        `Hola ${p.name} 🌸 ${p.professional} de Bellabel te recuerda: durante las primeras 6 horas no te acuestes ni agaches la cabeza, no masajees la zona tratada ni hagas actividad física intensa hoy. ¡Que tengas un excelente descanso!`,
    },
    {
      dayOffset: 3,
      time: "12:00",
      type: "checkin_inicio_efecto",
      textTemplate: (p) =>
        `¡Hola ${p.name}! ✨ En el día 3 la toxina botulínica comienza a actuar progresivamente relajando las líneas de expresión. Recuerda que el efecto definitivo se aprecia al día 14.`,
    },
    {
      dayOffset: 14,
      time: "11:00",
      type: "control_14_dias",
      textTemplate: (p) =>
        `Hola ${p.name} 🌿 Hoy se cumplen 14 días de tu aplicación de Bótox con ${p.professional}. El resultado ya está al 100%. ¿Cómo te sientes con el resultado frente al espejo? Si necesitas tu control presencial de retoque, avísanos para coordinar tu box en Bellabel.`,
    },
    {
      dayOffset: 150, // 5 meses
      time: "10:30",
      type: "mantencion_botox",
      textTemplate: (p) =>
        `Hola ${p.name} 🌸 Han pasado 5 meses desde tu última aplicación de Bótox. Para prevenir que las líneas de expresión vuelvan a marcarse, es el momento ideal de programar tu sesión de mantención con ${p.professional}. ¿Te gustaría revisar los cupos de este mes?`,
    },
  ],

  // Ácido Hialurónico
  hialuronico: [
    {
      dayOffset: 0,
      time: "21:00",
      type: "cuidados_noche_hialuronico",
      textTemplate: (p) =>
        `Hola ${p.name} 🌸 Cuidado de esta noche para ${p.zone}: dormir boca arriba, aplicar frío indirecto intermitente si sientes inflamación y beber abundante agua. No presionar la zona tratada. ¡Un abrazo de todo el equipo Bellabel!`,
    },
    {
      dayOffset: 2,
      time: "11:00",
      type: "checkin_inflamacion",
      textTemplate: (p) =>
        `Hola ${p.name} ✨ El día 2 es normal tener leve edema o pequeños hematomas que se reabsorberán solos. Bebe mucha agua para hidratar la molécula de ácido hialurónico. Si tienes cualquier consulta, aquí estamos.`,
    },
    {
      dayOffset: 15,
      time: "12:00",
      type: "resultado_estable",
      textTemplate: (p) =>
        `¡Hola ${p.name}! 🌿 A las dos semanas el ácido hialurónico ya está integrado al tejido con el volumen final definitivo. ¿Te encantó el resultado en ${p.zone}? Responde 1 para confirmar o 2 si deseas control con ${p.professional}.`,
    },
  ],
};

export async function createClinicalRecord(db: Db, input: ClinicalRecordInput) {
  const formattedRut = formatRut(input.patientRut);
  const recordId = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date();
  const procedureDate = input.procedureDate || new Date().toISOString().split("T")[0];

  const newRecord = {
    id: recordId,
    patientRut: formattedRut,
    bookingId: input.bookingId || null,
    treatmentId: input.treatmentId,
    treatmentName: input.treatmentName,
    professional: input.professional,
    sessionNumber: input.sessionNumber || 1,
    treatmentZone: input.treatmentZone,
    clinicalParameters: input.clinicalParameters || null,
    productsPrescribed: input.productsPrescribed || null,
    nextSessionRecommendedDate: input.nextSessionRecommendedDate || null,
    observations: input.observations || null,
    procedureDate,
    createdAt: now,
  };

  await db.insert(clinicalRecords).values(newRecord);

  return newRecord;
}

export async function schedulePostCareFollowups(
  db: Db,
  record: typeof clinicalRecords.$inferSelect,
  patientName: string,
  patientPhone: string
) {
  // Buscar plantilla adecuada
  let templateKey = "laser_tatuaje";
  const tId = record.treatmentId.toLowerCase();
  const tName = record.treatmentName.toLowerCase();

  if (tId.includes("botox") || tName.includes("botox") || tName.includes("toxina")) {
    templateKey = "botox";
  } else if (tId.includes("hialur") || tName.includes("hialur") || tName.includes("labio")) {
    templateKey = "hialuronico";
  } else if (tId.includes("tatuaje") || tName.includes("tatuaje") || tId.includes("laser")) {
    templateKey = "laser_tatuaje";
  }

  const templateSteps = POST_TREATMENT_SCHEDULE_TEMPLATES[templateKey] || POST_TREATMENT_SCHEDULE_TEMPLATES.laser_tatuaje;
  const procDateObj = new Date(record.procedureDate + "T12:00:00Z");
  const now = new Date();

  const insertedFollowups = [];

  for (const step of templateSteps) {
    const scheduledDate = new Date(procDateObj);
    scheduledDate.setUTCDate(scheduledDate.getUTCDate() + step.dayOffset);
    const dateStr = scheduledDate.toISOString().split("T")[0];
    const scheduledDatetime = `${dateStr} ${step.time}:00`;

    const messageText = step.textTemplate({
      name: patientName.split(" ")[0] || "Paciente",
      treatment: record.treatmentName,
      professional: record.professional,
      zone: record.treatmentZone,
      product: record.productsPrescribed || "crema cicatrizante recomendada",
    });

    const followupId = `flw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const followupRow = {
      id: followupId,
      recordId: record.id,
      patientRut: record.patientRut,
      phone: patientPhone,
      scheduledDatetime,
      messageType: step.type,
      messageText,
      status: "scheduled",
      patientReply: null,
      escalatedTo: null,
      sentAt: null,
      createdAt: now,
    };

    await db.insert(postTreatmentFollowups).values(followupRow);
    insertedFollowups.push(followupRow);
  }

  return insertedFollowups;
}

export async function getPatientFullHistory(db: Db, rut: string) {
  const formattedRut = formatRut(rut);

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.rut, formattedRut))
    .limit(1);

  if (!patient) return null;

  const records = await db
    .select()
    .from(clinicalRecords)
    .where(eq(clinicalRecords.patientRut, formattedRut))
    .orderBy(desc(clinicalRecords.procedureDate));

  const followups = await db
    .select()
    .from(postTreatmentFollowups)
    .where(eq(postTreatmentFollowups.patientRut, formattedRut))
    .orderBy(desc(postTreatmentFollowups.scheduledDatetime));

  return {
    patient,
    records,
    followups,
  };
}
