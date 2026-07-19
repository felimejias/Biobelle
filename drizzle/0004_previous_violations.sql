CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'receptionist' NOT NULL,
	`professional` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE INDEX `admin_users_role_idx` ON `admin_users` (`role`);--> statement-breakpoint
CREATE TABLE `booking_history` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`action` text NOT NULL,
	`actor_email` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `booking_history_booking_idx` ON `booking_history` (`booking_id`);--> statement-breakpoint
CREATE INDEX `booking_history_created_idx` ON `booking_history` (`created_at`);--> statement-breakpoint
CREATE TABLE `client_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`note` text NOT NULL,
	`author_email` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `client_notes_phone_idx` ON `client_notes` (`phone`);--> statement-breakpoint
CREATE TABLE `schedule_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`professional` text NOT NULL,
	`block_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`reason` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `schedule_blocks_date_idx` ON `schedule_blocks` (`block_date`);--> statement-breakpoint
CREATE INDEX `schedule_blocks_professional_idx` ON `schedule_blocks` (`professional`);