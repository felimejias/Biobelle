import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    confirmationCode: text("confirmation_code").notNull().unique(),
    managementToken: text("management_token").unique(),
    concernId: text("concern_id").notNull(),
    treatmentId: text("treatment_id").notNull(),
    treatmentName: text("treatment_name").notNull(),
    professional: text("professional").notNull(),
    appointmentDate: text("appointment_date").notNull(),
    appointmentTime: text("appointment_time").notNull(),
    patientName: text("patient_name").notNull(),
    patientRut: text("patient_rut"),
    phone: text("phone").notNull(),
    privacyConsent: integer("privacy_consent", { mode: "boolean" }).notNull().default(false),
    reminderConsent: integer("reminder_consent", { mode: "boolean" }).notNull().default(true),
    status: text("status").notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("bookings_professional_slot_unique").on(
      table.professional,
      table.appointmentDate,
      table.appointmentTime,
    ).where(sql`${table.status} IN ('pending', 'confirmed')`),
    index("bookings_phone_idx").on(table.phone),
    index("bookings_rut_idx").on(table.patientRut),
    index("bookings_date_idx").on(table.appointmentDate),
  ],
);

export const waitlist = sqliteTable(
  "waitlist",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    patientRut: text("patient_rut"),
    treatmentId: text("treatment_id").notNull(),
    preferredDate: text("preferred_date"),
    professional: text("professional").notNull().default("Sin preferencia"),
    privacyConsent: integer("privacy_consent", { mode: "boolean" }).notNull().default(false),
    status: text("status").notNull().default("waiting"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("waitlist_phone_idx").on(table.phone),
    index("waitlist_rut_idx").on(table.patientRut),
    index("waitlist_status_idx").on(table.status),
  ],
);

export const siteEvents = sqliteTable(
  "site_events",
  {
    id: text("id").primaryKey(),
    event: text("event").notNull(),
    path: text("path").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("site_events_event_idx").on(table.event), index("site_events_created_idx").on(table.createdAt)],
);

export const adminUsers = sqliteTable(
  "admin_users",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    passwordSalt: text("password_salt").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("receptionist"),
    professional: text("professional"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("admin_users_role_idx").on(table.role)],
);

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("admin_sessions_user_idx").on(table.userId),
    index("admin_sessions_expires_idx").on(table.expiresAt),
  ],
);

export const scheduleBlocks = sqliteTable(
  "schedule_blocks",
  {
    id: text("id").primaryKey(),
    professional: text("professional").notNull(),
    blockDate: text("block_date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    reason: text("reason").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("schedule_blocks_date_idx").on(table.blockDate), index("schedule_blocks_professional_idx").on(table.professional)],
);

export const bookingHistory = sqliteTable(
  "booking_history",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id").notNull(),
    action: text("action").notNull(),
    actorEmail: text("actor_email").notNull(),
    detail: text("detail").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("booking_history_booking_idx").on(table.bookingId), index("booking_history_created_idx").on(table.createdAt)],
);

export const clientNotes = sqliteTable(
  "client_notes",
  {
    id: text("id").primaryKey(),
    phone: text("phone").notNull(),
    note: text("note").notNull(),
    authorEmail: text("author_email").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("client_notes_phone_idx").on(table.phone)],
);

export const treatmentCatalog = sqliteTable(
  "treatment_catalog",
  {
    id: text("id").primaryKey(),
    label: text("label").notNull(),
    publicLabel: text("public_label").notNull(),
    duration: text("duration").notNull().default("Según evaluación"),
    price: text("price").notNull().default("Según evaluación"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(100),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("treatment_catalog_active_idx").on(table.active), index("treatment_catalog_sort_idx").on(table.sortOrder)],
);

export const professionalTreatments = sqliteTable(
  "professional_treatments",
  {
    professional: text("professional").notNull(),
    treatmentId: text("treatment_id").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("professional_treatments_unique").on(table.professional, table.treatmentId),
    index("professional_treatments_treatment_idx").on(table.treatmentId),
  ],
);
