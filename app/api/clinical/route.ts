import { getDb } from "../../../db";
import { getAdminIdentity } from "../../admin-auth";
import {
  validateRut,
  formatRut,
  upsertPatient,
  createClinicalRecord,
  schedulePostCareFollowups,
  getPatientFullHistory,
  POST_TREATMENT_SCHEDULE_TEMPLATES,
} from "../../clinical-service";

function unauthorized() {
  return Response.json({ error: "Acceso no autorizado." }, { status: 401 });
}

export async function GET(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity) return unauthorized();

  const url = new URL(request.url);
  const rutParam = url.searchParams.get("rut");

  if (!rutParam) {
    return Response.json(
      {
        error: "Parámetro 'rut' requerido para consultar la ficha clínica.",
        templates: Object.keys(POST_TREATMENT_SCHEDULE_TEMPLATES),
      },
      { status: 400 }
    );
  }

  if (!validateRut(rutParam)) {
    return Response.json(
      { error: "RUT inválido según Módulo 11 (P11 Carta Magna)." },
      { status: 400 }
    );
  }

  const db = getDb();
  const history = await getPatientFullHistory(db, rutParam);

  if (!history) {
    return Response.json({
      found: false,
      rut: formatRut(rutParam),
      message: "Paciente no encontrado en la base de datos.",
    });
  }

  return Response.json({
    found: true,
    ...history,
  });
}

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity) return unauthorized();

  try {
    const body = (await request.json()) as {
      rut: string;
      fullName: string;
      phone: string;
      email?: string;
      birthDate?: string;
      medicalAlerts?: string;
      treatmentId: string;
      treatmentName: string;
      professional: string;
      sessionNumber?: number;
      treatmentZone: string;
      clinicalParameters?: string;
      productsPrescribed?: string;
      nextSessionRecommendedDate?: string;
      observations?: string;
      procedureDate?: string;
    };

    if (!body.rut || !validateRut(body.rut)) {
      return Response.json(
        { error: "RUT inválido o no proporcionado (Módulo 11 obligatorio)." },
        { status: 400 }
      );
    }

    if (!body.fullName || !body.phone || !body.treatmentName || !body.treatmentZone) {
      return Response.json(
        { error: "Campos obligatorios faltantes: rut, fullName, phone, treatmentName, treatmentZone." },
        { status: 400 }
      );
    }

    const db = getDb();

    // 1. Guardar o actualizar la ficha maestra del Paciente por RUT
    const patient = await upsertPatient(db, {
      rut: body.rut,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      birthDate: body.birthDate,
      medicalAlerts: body.medicalAlerts,
    });

    // 2. Registrar el procedimiento en la Historia Clínica
    const record = await createClinicalRecord(db, {
      patientRut: patient.rut,
      treatmentId: body.treatmentId || "laser_tatuaje",
      treatmentName: body.treatmentName,
      professional: body.professional || identity.name,
      sessionNumber: body.sessionNumber || 1,
      treatmentZone: body.treatmentZone,
      clinicalParameters: body.clinicalParameters,
      productsPrescribed: body.productsPrescribed,
      nextSessionRecommendedDate: body.nextSessionRecommendedDate,
      observations: body.observations,
      procedureDate: body.procedureDate,
    });

    // 3. Programar automáticamente las alertas de acompañamiento por WhatsApp
    const followups = await schedulePostCareFollowups(
      db,
      record,
      patient.fullName,
      patient.phone
    );

    return Response.json({
      success: true,
      message: "Ficha clínica y seguimiento post-tratamiento activados exitosamente.",
      patient,
      record,
      followupsCount: followups.length,
      followups,
    });
  } catch (error) {
    return Response.json(
      { error: "Error procesando el registro clínico.", details: String(error) },
      { status: 500 }
    );
  }
}

