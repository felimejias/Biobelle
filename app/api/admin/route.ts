import { and, desc, eq, gte, lte } from "drizzle-orm";
import { getDb } from "../../../db";
import { adminUsers, bookingHistory, bookings, clientNotes, scheduleBlocks, treatmentCatalog, waitlist } from "../../../db/schema";
import { canEditAgenda, canManageUsers, getAdminIdentity, hashPassword, normalizeUsername } from "../../admin-auth";
import { PROFESSIONALS, slugifyTreatment } from "../../clinic-config";
import { ensureTreatmentAssignments, getClinicTreatments, getTreatmentById, nextTreatmentId } from "../../treatment-service";

const STATUSES = ["pending", "confirmed", "completed", "no_show", "cancelled"];

function unauthorized() {
  return Response.json({ error: "Acceso administrativo no autorizado." }, { status: 401 });
}

function normalizePhone(value: string) {
  return value.replace(/[^+\d]/g, "");
}

function bookingCode() {
  return `BIO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function GET(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity) return unauthorized();
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? new Date().toISOString().slice(0, 10);
  const to = url.searchParams.get("to") ?? from;
  const db = getDb();
  const dateConditions = [gte(bookings.appointmentDate, from), lte(bookings.appointmentDate, to)];
  if (identity.role === "professional" && identity.professional) dateConditions.push(eq(bookings.professional, identity.professional));

  const [bookingRows, blockRows, waitlistRows, recentRows, noteRows, userRows, treatmentRows] = await Promise.all([
    db.select().from(bookings).where(and(...dateConditions)).orderBy(bookings.appointmentDate, bookings.appointmentTime),
    db.select().from(scheduleBlocks).where(and(gte(scheduleBlocks.blockDate, from), lte(scheduleBlocks.blockDate, to))).orderBy(scheduleBlocks.blockDate, scheduleBlocks.startTime),
    identity.role === "professional" ? Promise.resolve([]) : db.select().from(waitlist).orderBy(desc(waitlist.createdAt)).limit(100),
    identity.role === "professional" && identity.professional
      ? db.select().from(bookings).where(eq(bookings.professional, identity.professional)).orderBy(desc(bookings.createdAt)).limit(500)
      : db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(1000),
    identity.role === "professional" ? Promise.resolve([]) : db.select().from(clientNotes).orderBy(desc(clientNotes.createdAt)).limit(500),
    canManageUsers(identity)
      ? db.select({ id: adminUsers.id, username: adminUsers.username, name: adminUsers.name, role: adminUsers.role, professional: adminUsers.professional, active: adminUsers.active }).from(adminUsers).orderBy(adminUsers.name)
      : Promise.resolve([]),
    identity.role === "professional" ? getClinicTreatments(db, true) : getClinicTreatments(db, false),
  ]);

  const clientMap = new Map<string, { name: string; rut?: string | null; phone: string; visits: number; lastDate: string; treatments: Set<string> }>();
  for (const row of recentRows) {
    const current = clientMap.get(row.phone) ?? { name: row.patientName, rut: row.patientRut, phone: row.phone, visits: 0, lastDate: row.appointmentDate, treatments: new Set<string>() };
    if (row.patientRut && !current.rut) current.rut = row.patientRut;
    current.visits += row.status !== "cancelled" ? 1 : 0;
    if (row.appointmentDate > current.lastDate) current.lastDate = row.appointmentDate;
    current.treatments.add(row.treatmentName);
    clientMap.set(row.phone, current);
  }

  const totalSlots = Math.max(1, countBusinessDays(from, to) * PROFESSIONALS.length * 6);
  const activeBookings = bookingRows.filter((row) => row.status !== "cancelled");
  return Response.json({
    identity,
    bookings: bookingRows,
    blocks: blockRows,
    waitlist: waitlistRows,
    users: userRows,
    treatments: treatmentRows,
    notes: noteRows,
    clients: [...clientMap.values()].map((client) => ({ ...client, treatments: [...client.treatments] })).slice(0, 250),
    metrics: {
      total: activeBookings.length,
      confirmed: activeBookings.filter((row) => row.status === "confirmed").length,
      pending: activeBookings.filter((row) => row.status === "pending").length,
      completed: activeBookings.filter((row) => row.status === "completed").length,
      noShow: activeBookings.filter((row) => row.status === "no_show").length,
      occupancy: Math.round((activeBookings.length / totalSlots) * 100),
      waiting: waitlistRows.filter((row) => row.status === "waiting").length,
    },
  });
}

export async function POST(request: Request) {
  const identity = await getAdminIdentity();
  if (!identity) return unauthorized();
  const payload = await request.json() as Record<string, unknown>;
  const action = String(payload.action ?? "");
  const db = getDb();

  if (action === "create_booking") {
    if (!canEditAgenda(identity)) return unauthorized();
    const professional = String(payload.professional ?? "");
    const date = String(payload.date ?? "");
    const time = String(payload.time ?? "");
    const treatmentId = String(payload.treatmentId ?? "evaluacion");
    const patientName = String(payload.patientName ?? "").trim();
    const phone = normalizePhone(String(payload.phone ?? ""));
    const treatment = await getTreatmentById(db, treatmentId);
    if (!treatment || !PROFESSIONALS.includes(professional as typeof PROFESSIONALS[number]) || !treatment.professionals.includes(professional as typeof PROFESSIONALS[number]) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || patientName.length < 3 || phone.length < 10) {
      return Response.json({ error: "Revisa los datos de la nueva reserva." }, { status: 400 });
    }
    if (identity.role === "professional" && identity.professional !== professional) return unauthorized();
    const id = crypto.randomUUID();
    await db.insert(bookings).values({
      id,
      confirmationCode: bookingCode(),
      managementToken: crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", ""),
      concernId: "administracion",
      treatmentId,
      treatmentName: treatment.label,
      professional,
      appointmentDate: date,
      appointmentTime: time,
      patientName,
      phone,
      privacyConsent: true,
      reminderConsent: Boolean(payload.reminderConsent ?? true),
      status: "confirmed",
      createdAt: new Date(),
    });
    await addHistory(id, "created_by_admin", identity.email, { professional, date, time });
    return Response.json({ ok: true });
  }

  if (action === "update_booking") {
    if (!canEditAgenda(identity)) return unauthorized();
    const id = String(payload.id ?? "");
    const [current] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    if (!current) return Response.json({ error: "Reserva no encontrada." }, { status: 404 });
    if (identity.role === "professional" && identity.professional !== current.professional) return unauthorized();
    const status = String(payload.status ?? current.status);
    const professional = String(payload.professional ?? current.professional);
    const date = String(payload.date ?? current.appointmentDate);
    const time = String(payload.time ?? current.appointmentTime);
    const treatment = await getTreatmentById(db, current.treatmentId);
    if (!STATUSES.includes(status) || !PROFESSIONALS.includes(professional as typeof PROFESSIONALS[number]) || (treatment && !treatment.professionals.includes(professional as typeof PROFESSIONALS[number]))) return Response.json({ error: "Actualización no válida." }, { status: 400 });
    await db.update(bookings).set({ status, professional, appointmentDate: date, appointmentTime: time }).where(eq(bookings.id, id));
    await addHistory(id, "updated", identity.email, { before: { status: current.status, professional: current.professional, date: current.appointmentDate, time: current.appointmentTime }, after: { status, professional, date, time } });
    return Response.json({ ok: true });
  }

  if (action === "create_block") {
    if (!canEditAgenda(identity)) return unauthorized();
    const professional = String(payload.professional ?? "");
    if (!PROFESSIONALS.includes(professional as typeof PROFESSIONALS[number]) || (identity.role === "professional" && identity.professional !== professional)) return unauthorized();
    await db.insert(scheduleBlocks).values({
      id: crypto.randomUUID(),
      professional,
      blockDate: String(payload.date ?? ""),
      startTime: String(payload.startTime ?? "09:00"),
      endTime: String(payload.endTime ?? "19:00"),
      reason: String(payload.reason ?? "Horario bloqueado").slice(0, 120),
      createdBy: identity.email,
      createdAt: new Date(),
    });
    return Response.json({ ok: true });
  }

  if (action === "delete_block") {
    if (!canEditAgenda(identity)) return unauthorized();
    await db.delete(scheduleBlocks).where(eq(scheduleBlocks.id, String(payload.id ?? "")));
    return Response.json({ ok: true });
  }

  if (action === "update_waitlist") {
    if (identity.role === "professional") return unauthorized();
    const status = String(payload.status ?? "waiting");
    if (!inArrayValue(status, ["waiting", "contacted", "booked", "closed"])) return Response.json({ error: "Estado no válido." }, { status: 400 });
    await db.update(waitlist).set({ status }).where(eq(waitlist.id, String(payload.id ?? "")));
    return Response.json({ ok: true });
  }

  if (action === "add_note") {
    const phone = normalizePhone(String(payload.phone ?? ""));
    const note = String(payload.note ?? "").trim();
    if (phone.length < 10 || note.length < 2) return Response.json({ error: "Escribe una nota válida." }, { status: 400 });
    await db.insert(clientNotes).values({ id: crypto.randomUUID(), phone, note: note.slice(0, 2000), authorEmail: identity.email, createdAt: new Date() });
    return Response.json({ ok: true });
  }

  if (action === "add_user") {
    if (!canManageUsers(identity)) return unauthorized();
    const username = normalizeUsername(String(payload.username ?? ""));
    const password = String(payload.password ?? "");
    const role = String(payload.role ?? "receptionist");
    if (username.length < 3 || password.length < 4 || !["general_admin", "location_admin", "receptionist", "professional", "readonly"].includes(role)) return Response.json({ error: "Usuario no válido." }, { status: 400 });
    const salt = crypto.randomUUID();
    await db.insert(adminUsers).values({
      id: crypto.randomUUID(),
      username,
      email: `${username}@biobelle.local`,
      passwordHash: await hashPassword(password, salt),
      passwordSalt: salt,
      name: String(payload.name ?? username).slice(0, 100),
      role,
      professional: role === "professional" ? String(payload.professional ?? "") : null,
      active: true,
      createdAt: new Date(),
    });
    return Response.json({ ok: true });
  }

  if (action === "toggle_user") {
    if (!canManageUsers(identity)) return unauthorized();
    await db.update(adminUsers).set({ active: Boolean(payload.active) }).where(eq(adminUsers.id, String(payload.id ?? "")));
    return Response.json({ ok: true });
  }

  if (action === "add_treatment") {
    if (!canManageUsers(identity)) return unauthorized();
    const label = String(payload.label ?? "").trim();
    const publicLabel = String(payload.publicLabel ?? label).trim();
    const duration = String(payload.duration ?? "Según evaluación").trim() || "Según evaluación";
    const price = String(payload.price ?? "Según evaluación").trim() || "Según evaluación";
    const enabledProfessionals = Array.isArray(payload.professionals) ? payload.professionals.map(String).filter((item) => PROFESSIONALS.includes(item as typeof PROFESSIONALS[number])) : [...PROFESSIONALS];
    if (label.length < 3 || !enabledProfessionals.length) return Response.json({ error: "Agrega un nombre y al menos una profesional habilitada." }, { status: 400 });
    const treatments = await getClinicTreatments(db, false);
    const id = nextTreatmentId(slugifyTreatment(label), treatments.map((item) => item.id));
    await db.insert(treatmentCatalog).values({
      id,
      label: label.slice(0, 120),
      publicLabel: publicLabel.slice(0, 120),
      duration: duration.slice(0, 60),
      price: price.slice(0, 60),
      active: true,
      sortOrder: Math.max(100, ...treatments.map((item) => item.sortOrder)) + 10,
      createdAt: new Date(),
    });
    await ensureTreatmentAssignments(db, id, enabledProfessionals);
    return Response.json({ ok: true });
  }

  if (action === "update_treatment_assignment") {
    if (!canManageUsers(identity)) return unauthorized();
    const treatmentId = String(payload.treatmentId ?? "");
    const professional = String(payload.professional ?? "");
    const enabled = Boolean(payload.enabled);
    const treatment = await getTreatmentById(db, treatmentId);
    if (!treatment || !PROFESSIONALS.includes(professional as typeof PROFESSIONALS[number])) return Response.json({ error: "Tratamiento o profesional no válido." }, { status: 400 });
    const nextProfessionals = enabled
      ? [...new Set([...treatment.professionals, professional])]
      : treatment.professionals.filter((item) => item !== professional);
    if (!nextProfessionals.length) return Response.json({ error: "Cada tratamiento debe tener al menos una profesional habilitada." }, { status: 400 });
    await ensureTreatmentAssignments(db, treatmentId, nextProfessionals);
    return Response.json({ ok: true });
  }

  if (action === "toggle_treatment") {
    if (!canManageUsers(identity)) return unauthorized();
    await db.update(treatmentCatalog).set({ active: Boolean(payload.active) }).where(eq(treatmentCatalog.id, String(payload.treatmentId ?? "")));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Acción administrativa no reconocida." }, { status: 400 });
}

async function addHistory(bookingId: string, action: string, actorEmail: string, detail: unknown) {
  await getDb().insert(bookingHistory).values({ id: crypto.randomUUID(), bookingId, action, actorEmail, detail: JSON.stringify(detail), createdAt: new Date() });
}

function countBusinessDays(from: string, to: string) {
  let count = 0;
  const cursor = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  while (cursor <= end) {
    if (cursor.getDay() !== 0) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function inArrayValue<T extends string>(value: string, options: T[]): value is T {
  return options.includes(value as T);
}
