CREATE TABLE IF NOT EXISTS `professional_profiles` (
  `professional` text PRIMARY KEY NOT NULL,
  `image` text NOT NULL,
  `role` text NOT NULL,
  `focus` text NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO `professional_profiles` (`professional`, `image`, `role`, `focus`, `updated_at`) VALUES
  ('Kiara Moscoso', '/images/kiara-moscoso-clean.png', 'Enfermera dermoestética · Cosmetóloga', 'Armonización · Láser · Dermoestética', unixepoch() * 1000),
  ('Pía Orellana', '/images/pia-orellana-clean.png', 'Enfermera dermoestética · Cosmetóloga', 'Armonización · Láser · Salud integral', unixepoch() * 1000),
  ('Dr. Luis Moscoso', '/images/dr-luis-moscoso.jpg', 'Médico Cirujano Estético · Director Médico', 'Medicina Estética · Armonización Facial', unixepoch() * 1000);
