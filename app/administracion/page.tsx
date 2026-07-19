import Link from "next/link";
import { getAdminIdentity } from "../admin-auth";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdministrationPage() {
  const authenticated = await requireChatGPTUser("/administracion");
  const identity = await getAdminIdentity();

  if (!identity) {
    return (
      <main className="admin-access-page">
        <section className="admin-access-card">
          <img src="/images/biobelle-lockup.png" alt="BIOBELLE Centro Médico Estético" />
          <p>ACCESO DEL EQUIPO</p>
          <h1>Tu identidad está confirmada.</h1>
          <span>La cuenta <b>{authenticated.email}</b> todavía no ha sido autorizada por la administradora general de BIOBELLE.</span>
          <div><Link href="/">Volver a biobelle.cl</Link><a href={chatGPTSignOutPath("/administracion")}>Usar otra cuenta</a></div>
        </section>
      </main>
    );
  }

  return <AdminDashboard initialIdentity={identity} signOutPath={chatGPTSignOutPath("/")} />;
}
