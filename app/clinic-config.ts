export const PROFESSIONALS = ["Kiara Moscoso", "Pía Orellana"] as const;
export const SLOTS = ["09:30", "11:00", "12:30", "15:30", "17:00", "18:30"] as const;
export const OPENING_DATE = "2026-08-10";

export type ProfessionalName = typeof PROFESSIONALS[number];

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
  { id: "evaluacion", label: "Evaluación estética personalizada", publicLabel: "Evaluación estética personalizada", duration: "40 min", price: "Sin compromiso", active: true, sortOrder: 10, professionals: [...PROFESSIONALS] },
  { id: "armonizacion", label: "Armonización facial", publicLabel: "Armonización facial", duration: "45–60 min", price: "Evaluación previa", active: true, sortOrder: 20, professionals: [...PROFESSIONALS] },
  { id: "piel", label: "Evaluación dermoestética", publicLabel: "Dermoestética", duration: "60–75 min", price: "Desde $35.000", active: true, sortOrder: 30, professionals: [...PROFESSIONALS] },
  { id: "laser", label: "Tecnología láser", publicLabel: "Tecnología láser", duration: "30–60 min", price: "Según evaluación", active: true, sortOrder: 40, professionals: [...PROFESSIONALS] },
  { id: "regenerativa", label: "Medicina regenerativa", publicLabel: "Medicina regenerativa", duration: "60 min", price: "Desde $85.000", active: true, sortOrder: 50, professionals: [...PROFESSIONALS] },
  { id: "lesiones", label: "Cuidado clínico", publicLabel: "Cuidado clínico", duration: "30–45 min", price: "Desde $30.000", active: true, sortOrder: 60, professionals: [...PROFESSIONALS] },
  { id: "corporal", label: "Dermoestética corporal", publicLabel: "Dermoestética corporal", duration: "45–75 min", price: "Plan personalizado", active: true, sortOrder: 70, professionals: [...PROFESSIONALS] },
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
