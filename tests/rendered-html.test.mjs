import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("keeps the BIOBELLE brand, contact channels and booking journey visible", async () => {
  const [page, brand] = await Promise.all([source("app/page.tsx"), source("app/components/BrandSocial.tsx")]);
  assert.match(page, /Tu belleza,/);
  assert.match(page, /AGENDA INTELIGENTE/);
  assert.match(page, /api\/bookings\//);
  assert.match(page, /Reprogramar o cancelar mi hora/);
  assert.match(page, /lista-espera/);
  assert.match(brand, /biobelle-lockup\.png/);
  assert.match(brand, /@biobelle_center/);
  assert.match(brand, /\+56 9 7965 5129/);
});

test("ships persistent booking management, waitlist and privacy-aware analytics", async () => {
  const [schema, availabilityApi, bookingApi, reservationApi, waitlistApi, eventsApi] = await Promise.all([
    source("db/schema.ts"),
    source("app/api/availability/route.ts"),
    source("app/api/bookings/route.ts"),
    source("app/api/reservations/[token]/route.ts"),
    source("app/api/waitlist/route.ts"),
    source("app/api/events/route.ts"),
  ]);
  assert.match(schema, /managementToken/);
  assert.match(schema, /export const waitlist/);
  assert.match(schema, /export const siteEvents/);
  assert.match(availabilityApi, /2026-08-10/);
  assert.match(bookingApi, /2026-08-10/);
  assert.match(bookingApi, /managementUrl/);
  assert.match(reservationApi, /reschedule/);
  assert.match(reservationApi, /cancelled/);
  assert.match(waitlistApi, /privacyConsent/);
  assert.doesNotMatch(eventsApi, /phone|patientName|email/);
});

test("publishes local SEO metadata and indexable public routes", async () => {
  const [layout, sitemap, robots] = await Promise.all([
    source("app/layout.tsx"),
    source("app/sitemap.ts"),
    source("app/robots.ts"),
  ]);
  assert.match(layout, /MedicalBusiness/);
  assert.match(layout, /Bueras 218/);
  assert.match(layout, /application\/ld\+json/);
  assert.match(sitemap, /tratamientos/);
  assert.match(sitemap, /equipo/);
  assert.match(robots, /sitemap\.xml/);
  assert.match(robots, /\/reserva\//);
  await Promise.all([
    access(new URL("app/lista-espera/page.tsx", root)),
    access(new URL("app/reserva/[token]/page.tsx", root)),
    access(new URL("app/equipo/[slug]/page.tsx", root)),
  ]);
});

test("protects and ships the BIOBELLE operations console", async () => {
  const [adminPage, login, dashboard, adminApi, auth, sessionApi, schema, availability] = await Promise.all([
    source("app/administracion/page.tsx"),
    source("app/administracion/AdminLogin.tsx"),
    source("app/administracion/AdminDashboard.tsx"),
    source("app/api/admin/route.ts"),
    source("app/admin-auth.ts"),
    source("app/api/admin/session/route.ts"),
    source("db/schema.ts"),
    source("app/api/availability/route.ts"),
  ]);
  assert.match(adminPage, /AdminLogin/);
  assert.match(login, /Usuario/);
  assert.match(login, /Clave/);
  assert.match(auth, /biobelle_admin_session/);
  assert.match(sessionApi, /INITIAL_ADMIN/);
  assert.match(sessionApi, /username: "admin"/);
  assert.match(dashboard, /Usuarios y permisos/);
  assert.match(dashboard, /Clave inicial/);
  assert.match(dashboard, /Bloquear horario/);
  assert.match(dashboard, /Lista de espera/);
  assert.match(adminApi, /create_booking/);
  assert.match(adminApi, /update_booking/);
  assert.match(adminApi, /hashPassword/);
  assert.match(schema, /export const adminUsers/);
  assert.match(schema, /export const adminSessions/);
  assert.match(schema, /export const scheduleBlocks/);
  assert.match(schema, /export const bookingHistory/);
  assert.match(schema, /export const clientNotes/);
  assert.match(availability, /scheduleBlocks/);
});
