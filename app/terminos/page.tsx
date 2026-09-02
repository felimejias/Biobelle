import type { Metadata } from "next";
import Link from "next/link";
import { BrandSocial } from "../components/BrandSocial";

export const metadata: Metadata = {
  title: "Políticas de Reserva | Bellabel Centro Médico - Estético",
  description: "Políticas de reserva, abonos, puntualidad y condiciones de atención en Bellabel.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="announcement">Bellabel · Políticas de reserva y atención clínica transparente</div>
      <header className="site-header legal-header">
        <BrandSocial />
        <Link className="back-home" href="/">← Volver al inicio</Link>
      </header>
      <article className="legal-document">
        <p>BELLABEL CENTRO MÉDICO - ESTÉTICO</p>
        <h1>✦ POLÍTICAS DE RESERVA ✦</h1>
        <p className="legal-updated">Atención en Bueras 218, Edificio Olavarría, Oficina 302, Rancagua</p>

        <div className="policy-banner">
          <div className="policy-banner-head">
            <h2>Transparencia y Respeto por tu Tiempo</h2>
            <p>En <b>Bellabel Centro Médico & Estético</b> valoramos tu tiempo y el de cada uno de nuestros pacientes. Cumplir estas políticas nos permite brindar una atención puntual, personalizada y de excelencia. 💖</p>
          </div>

          <div className="policy-grid">
            <div className="policy-item-card highlight">
              <div className="policy-icon-title">
                <span>📅</span>
                <b>Abono de Reserva de Tratamiento</b>
              </div>
              <p>
                Para agendar tu hora se solicita un abono mínimo de <span className="policy-badge-price">$20.000</span>, el cual será <b>descontado del valor total del tratamiento</b> el día de tu cita.
              </p>
            </div>

            <div className="policy-item-card">
              <div className="policy-icon-title">
                <span>🔍</span>
                <b>Consulta de Evaluación</b>
              </div>
              <p>
                Si deseas solo evaluación estética o clínica, el valor es de <span className="policy-badge-price">$10.000</span>, monto que <b>no es descontable</b> del tratamiento.
              </p>
            </div>

            <div className="policy-item-card">
              <div className="policy-icon-title">
                <span>🔔</span>
                <b>Confirmación de Reserva</b>
              </div>
              <p>
                La hora queda confirmada <b>únicamente una vez realizado el abono</b>. Si no se realiza el depósito dentro del plazo, la hora no será agendada y quedará libre para otra paciente.
              </p>
            </div>

            <div className="policy-item-card highlight">
              <div className="policy-icon-title">
                <span>⏱️</span>
                <b>Puntualidad y Tolerancia</b>
              </div>
              <p>
                Cada hora es <b>exclusiva para un paciente</b>, por lo que solicitamos puntualidad. La tolerancia máxima de atraso es de <b>10 minutos</b>. Pasado ese tiempo, la atención podrá ser reagendada según disponibilidad.
              </p>
            </div>

            <div className="policy-item-card">
              <div className="policy-icon-title">
                <span>📲</span>
                <b>Avisos y Reagendamiento (24 hrs)</b>
              </div>
              <p>
                Si no puedes asistir a tu cita, agradecemos avisar con al menos <b>24 horas de anticipación</b> para conservar tu abono y reagendar tu atención.
              </p>
            </div>

            <div className="policy-item-card">
              <div className="policy-icon-title">
                <span>⚠️</span>
                <b>Inasistencia sin Aviso</b>
              </div>
              <p>
                El abono asegura exclusivamente la reserva de tu horario. La <b>inasistencia sin aviso previo (no show)</b> implica la pérdida del abono de reserva.
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2>Compromiso BIOBELLE</h2>
          <p>
            En <b>Biobelle Centro Médico & Estético</b> nos esforzamos por brindar una experiencia cercana, clínica y segura. Agradecemos tu comprensión y colaboración para mantener la excelencia en la atención de cada paciente.
          </p>
          <div style={{ marginTop: 25 }}>
            <Link className="primary" href="/?agendar=evaluacion">Agendar mi atención ↗</Link>
          </div>
        </section>
      </article>
    </main>
  );
}

