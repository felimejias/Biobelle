CREATE TABLE `site_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event` text NOT NULL,
	`path` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `site_events_event_idx` ON `site_events` (`event`);--> statement-breakpoint
CREATE INDEX `site_events_created_idx` ON `site_events` (`created_at`);--> statement-breakpoint
CREATE TABLE `waitlist` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`treatment_id` text NOT NULL,
	`preferred_date` text,
	`professional` text DEFAULT 'Primera disponible' NOT NULL,
	`privacy_consent` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `waitlist_phone_idx` ON `waitlist` (`phone`);--> statement-breakpoint
CREATE INDEX `waitlist_status_idx` ON `waitlist` (`status`);--> statement-breakpoint
ALTER TABLE `bookings` ADD `management_token` text;--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_management_token_unique` ON `bookings` (`management_token`);--> statement-breakpoint
CREATE INDEX `bookings_phone_idx` ON `bookings` (`phone`);--> statement-breakpoint
CREATE INDEX `bookings_date_idx` ON `bookings` (`appointment_date`);