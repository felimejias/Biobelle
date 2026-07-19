CREATE TABLE `treatment_catalog` (
  `id` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `public_label` text NOT NULL,
  `duration` text DEFAULT 'Según evaluación' NOT NULL,
  `price` text DEFAULT 'Según evaluación' NOT NULL,
  `active` integer DEFAULT true NOT NULL,
  `sort_order` integer DEFAULT 100 NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `treatment_catalog_active_idx` ON `treatment_catalog` (`active`);
--> statement-breakpoint
CREATE INDEX `treatment_catalog_sort_idx` ON `treatment_catalog` (`sort_order`);
--> statement-breakpoint
CREATE TABLE `professional_treatments` (
  `professional` text NOT NULL,
  `treatment_id` text NOT NULL,
  `enabled` integer DEFAULT true NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `professional_treatments_unique` ON `professional_treatments` (`professional`,`treatment_id`);
--> statement-breakpoint
CREATE INDEX `professional_treatments_treatment_idx` ON `professional_treatments` (`treatment_id`);
--> statement-breakpoint
INSERT OR IGNORE INTO `treatment_catalog` (`id`, `label`, `public_label`, `duration`, `price`, `active`, `sort_order`, `created_at`) VALUES
  ('evaluacion', 'Evaluación estética personalizada', 'Evaluación estética personalizada', '40 min', 'Sin compromiso', true, 10, unixepoch() * 1000),
  ('armonizacion', 'Armonización facial', 'Armonización facial', '45–60 min', 'Evaluación previa', true, 20, unixepoch() * 1000),
  ('piel', 'Evaluación dermoestética', 'Dermoestética', '60–75 min', 'Desde $35.000', true, 30, unixepoch() * 1000),
  ('laser', 'Tecnología láser', 'Tecnología láser', '30–60 min', 'Según evaluación', true, 40, unixepoch() * 1000),
  ('regenerativa', 'Medicina regenerativa', 'Medicina regenerativa', '60 min', 'Desde $85.000', true, 50, unixepoch() * 1000),
  ('lesiones', 'Cuidado clínico', 'Cuidado clínico', '30–45 min', 'Desde $30.000', true, 60, unixepoch() * 1000),
  ('corporal', 'Dermoestética corporal', 'Dermoestética corporal', '45–75 min', 'Plan personalizado', true, 70, unixepoch() * 1000);
--> statement-breakpoint
INSERT OR IGNORE INTO `professional_treatments` (`professional`, `treatment_id`, `enabled`, `updated_at`) VALUES
  ('Kiara Moscoso', 'evaluacion', true, unixepoch() * 1000),
  ('Kiara Moscoso', 'armonizacion', true, unixepoch() * 1000),
  ('Kiara Moscoso', 'piel', true, unixepoch() * 1000),
  ('Kiara Moscoso', 'laser', true, unixepoch() * 1000),
  ('Kiara Moscoso', 'regenerativa', true, unixepoch() * 1000),
  ('Kiara Moscoso', 'lesiones', true, unixepoch() * 1000),
  ('Kiara Moscoso', 'corporal', true, unixepoch() * 1000),
  ('Pía Orellana', 'evaluacion', true, unixepoch() * 1000),
  ('Pía Orellana', 'armonizacion', true, unixepoch() * 1000),
  ('Pía Orellana', 'piel', true, unixepoch() * 1000),
  ('Pía Orellana', 'laser', true, unixepoch() * 1000),
  ('Pía Orellana', 'regenerativa', true, unixepoch() * 1000),
  ('Pía Orellana', 'lesiones', true, unixepoch() * 1000),
  ('Pía Orellana', 'corporal', true, unixepoch() * 1000);
