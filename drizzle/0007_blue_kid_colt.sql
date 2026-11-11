CREATE TABLE IF NOT EXISTS `patients` (
	`rut` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`birth_date` text,
	`medical_alerts` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `patients_phone_idx` ON `patients` (`phone`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `clinical_records` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_rut` text NOT NULL,
	`booking_id` text,
	`treatment_id` text NOT NULL,
	`treatment_name` text NOT NULL,
	`professional` text NOT NULL,
	`session_number` integer DEFAULT 1 NOT NULL,
	`treatment_zone` text NOT NULL,
	`clinical_parameters` text,
	`products_prescribed` text,
	`next_session_recommended_date` text,
	`observations` text,
	`procedure_date` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`patient_rut`) REFERENCES `patients`(`rut`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `clinical_records_patient_rut_idx` ON `clinical_records` (`patient_rut`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `clinical_records_procedure_date_idx` ON `clinical_records` (`procedure_date`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `clinical_records_treatment_idx` ON `clinical_records` (`treatment_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `post_treatment_followups` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`patient_rut` text NOT NULL,
	`phone` text NOT NULL,
	`scheduled_datetime` text NOT NULL,
	`message_type` text NOT NULL,
	`message_text` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`patient_reply` text,
	`escalated_to` text,
	`sent_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`record_id`) REFERENCES `clinical_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `followups_patient_rut_idx` ON `post_treatment_followups` (`patient_rut`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `followups_status_idx` ON `post_treatment_followups` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `followups_scheduled_idx` ON `post_treatment_followups` (`scheduled_datetime`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `followups_record_idx` ON `post_treatment_followups` (`record_id`);
