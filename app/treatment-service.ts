import { and, asc, eq } from "drizzle-orm";
import type { getDb } from "../db";
import { professionalTreatments, treatmentCatalog } from "../db/schema";
import { DEFAULT_TREATMENTS, PROFESSIONALS, type ClinicTreatment, type ProfessionalName, eligibleProfessionals, slugifyTreatment } from "./clinic-config";

type Db = ReturnType<typeof getDb>;

function normalizeTreatment(row: typeof treatmentCatalog.$inferSelect, enabledRows: typeof professionalTreatments.$inferSelect[]): ClinicTreatment {
  const assigned = enabledRows
    .filter((item) => item.treatmentId === row.id && item.enabled)
    .map((item) => item.professional)
    .filter((value): value is ProfessionalName => PROFESSIONALS.includes(value as ProfessionalName));
  return {
    id: row.id,
    label: row.label,
    publicLabel: row.publicLabel,
    duration: row.duration,
    price: row.price,
    active: row.active,
    sortOrder: row.sortOrder,
    professionals: assigned.length ? assigned : [...PROFESSIONALS],
  };
}

export async function getClinicTreatments(db: Db, activeOnly = true) {
  try {
    const rows = await db.select().from(treatmentCatalog).orderBy(asc(treatmentCatalog.sortOrder), asc(treatmentCatalog.label));
    if (!rows.length) return activeOnly ? DEFAULT_TREATMENTS.filter((item) => item.active) : DEFAULT_TREATMENTS;
    const enabledRows = await db.select().from(professionalTreatments);
    const treatments = rows.map((row) => normalizeTreatment(row, enabledRows));
    return activeOnly ? treatments.filter((item) => item.active) : treatments;
  } catch (error) {
    if (error instanceof Error && /no such table/i.test(error.message)) return activeOnly ? DEFAULT_TREATMENTS.filter((item) => item.active) : DEFAULT_TREATMENTS;
    throw error;
  }
}

export async function getTreatmentById(db: Db, treatmentId: string) {
  const treatments = await getClinicTreatments(db, true);
  return treatments.find((item) => item.id === treatmentId) ?? null;
}

export async function getEligibleProfessionals(db: Db, treatmentId: string) {
  const treatments = await getClinicTreatments(db, true);
  return eligibleProfessionals(treatmentId, treatments);
}

export async function ensureTreatmentAssignments(db: Db, treatmentId: string, enabledProfessionals: string[]) {
  for (const professional of PROFESSIONALS) {
    const enabled = enabledProfessionals.includes(professional);
    const now = new Date();
    const [existing] = await db.select().from(professionalTreatments).where(and(eq(professionalTreatments.professional, professional), eq(professionalTreatments.treatmentId, treatmentId))).limit(1);
    if (existing) {
      await db.update(professionalTreatments).set({ enabled, updatedAt: now }).where(and(eq(professionalTreatments.professional, professional), eq(professionalTreatments.treatmentId, treatmentId)));
      continue;
    }
    try {
      await db.insert(professionalTreatments).values({ professional, treatmentId, enabled, updatedAt: now });
    } catch (error) {
      if (error instanceof Error && /no such table/i.test(error.message)) throw error;
    }
  }
}

export function nextTreatmentId(label: string, existingIds: string[]) {
  const base = slugifyTreatment(label) || `tratamiento-${Date.now()}`;
  if (!existingIds.includes(base)) return base;
  let index = 2;
  while (existingIds.includes(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}
