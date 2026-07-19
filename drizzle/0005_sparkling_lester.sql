CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_sessions_token_hash_unique` ON `admin_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `admin_sessions_user_idx` ON `admin_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `admin_sessions_expires_idx` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
ALTER TABLE `admin_users` ADD `username` text;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `password_hash` text;--> statement-breakpoint
ALTER TABLE `admin_users` ADD `password_salt` text;--> statement-breakpoint
UPDATE `admin_users` SET `username` = 'user_' || substr(`id`, 1, 8) WHERE `username` IS NULL OR `username` = '';--> statement-breakpoint
UPDATE `admin_users` SET `password_hash` = 'disabled_until_password_reset' WHERE `password_hash` IS NULL OR `password_hash` = '';--> statement-breakpoint
UPDATE `admin_users` SET `password_salt` = 'legacy-disabled' WHERE `password_salt` IS NULL OR `password_salt` = '';--> statement-breakpoint
INSERT OR IGNORE INTO `admin_users` (`id`, `email`, `username`, `password_hash`, `password_salt`, `name`, `role`, `professional`, `active`, `created_at`) VALUES ('biobelle-initial-general-admin', 'admin@biobelle.local', 'admin', 'bce5c69c5258c5915c414e9a81b8b55fd26ccbc4bfb02ebf1fc87da4baf60fd9', 'biobelle-initial-admin-2026-07-19', 'Administrador general', 'general_admin', NULL, true, unixepoch() * 1000);--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_username_unique` ON `admin_users` (`username`);
