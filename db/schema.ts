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
    index("bookings_date_idx").on(table.appointmentDate),
  ],
);

export const waitlist = sqliteTable(
  "waitlist",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    treatmentId: text("treatment_id").notNull(),
    preferredDate: text("preferred_date"),
    professional: text("professional").notNull().default("Primera disponible"),
    privacyConsent: integer("privacy_consent", { mode: "boolean" }).notNull().default(false),
    status: text("status").notNull().default("waiting"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("waitlist_phone_idx").on(table.phone), index("waitlist_status_idx").on(table.status)],
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
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    role: text("role").notNull().default("receptionist"),
    professional: text("professional"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("admin_users_role_idx").on(table.role)],
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
