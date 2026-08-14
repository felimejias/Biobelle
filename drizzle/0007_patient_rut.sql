ALTER TABLE `bookings` ADD `patient_rut` text;--> statement-breakpoint
ALTER TABLE `waitlist` ADD `patient_rut` text;--> statement-breakpoint
CREATE INDEX `bookings_rut_idx` ON `bookings` (`patient_rut`);--> statement-breakpoint
CREATE INDEX `waitlist_rut_idx` ON `waitlist` (`patient_rut`);
