import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    confirmationCode: text("confirmation_code").notNull().unique(),
    concernId: text("concern_id").notNull(),
    treatmentId: text("treatment_id").notNull(),
    treatmentName: text("treatment_name").notNull(),
    professional: text("professional").notNull(),
    appointmentDate: text("appointment_date").notNull(),
    appointmentTime: text("appointment_time").notNull(),
    patientName: text("patient_name").notNull(),
    phone: text("phone").notNull(),
    reminderConsent: integer("reminder_consent", { mode: "boolean" }).notNull().default(true),
    status: text("status").notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("bookings_professional_slot_unique").on(
      table.professional,
      table.appointmentDate,
      table.appointmentTime,
    ),
  ],
);
