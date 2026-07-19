CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`confirmation_code` text NOT NULL,
	`concern_id` text NOT NULL,
	`treatment_id` text NOT NULL,
	`treatment_name` text NOT NULL,
	`professional` text NOT NULL,
	`appointment_date` text NOT NULL,
	`appointment_time` text NOT NULL,
	`patient_name` text NOT NULL,
	`phone` text NOT NULL,
	`reminder_consent` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_confirmation_code_unique` ON `bookings` (`confirmation_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_professional_slot_unique` ON `bookings` (`professional`,`appointment_date`,`appointment_time`);