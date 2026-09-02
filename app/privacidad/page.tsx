import type { Metadata } from "next";
import Link from "next/link";
import { BrandSocial } from "../components/BrandSocial";

export const metadata: Metadata = {
  title: "Política de Privacidad | Bellabel",
  description: "Conoce cómo Bellabel utiliza y protege los datos entregados al solicitar una reserva.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="announcement">Bellabel · Transparencia y cuidado de tus datos</div>
      <header className="site-header legal-header"><BrandSocial /><Link className="back-home" href="/">← Volver al inicio</Link></header>
      <article className="legal-document">
        <p>Privacidad Bellabel</p><h1>Tu información merece el mismo cuidado que tú.</h1><p className="legal-updated">Última actualización: 19 de julio de 2026</p>
        <section><h2>1. Responsable y alcance</h2><p>Bellabel Centro Médico Estético, ubicado en Bueras 218, Edificio Olavarría, Oficina 302, Rancagua, utiliza los datos entregados en biobelle.cl para administrar solicitudes de hora y comunicaciones relacionadas con la atención.</p></section>
        <section><h2>2. Datos que recopilamos</h2><ul><li>Nombre completo y RUT / Pasaporte (conforme a la Ley N.º 20.584 para identificación inequívoca del paciente y ficha clínica).</li><li>Número de WhatsApp de contacto.</li><li>Tratamiento de interés, profesional de la salud tratante, fecha y hora solicitada.</li><li>Consentimiento para recordatorios y gestión de la cita médica-estética.</li><li>Registros técnicos mínimos de seguridad para trazabilidad y prevención de incidentes (estándar ISO/IEC 27001).</li></ul></section>
        <section><h2>3. Para qué usamos los datos</h2><ul><li>Gestionar, confirmar y registrar la reserva de atención clínica y estética.</li><li>Contactar a la paciente para confirmación, envío de indicaciones previas y protocolos posteriores.</li><li>Verificar identidad en conformidad con los protocolos de seguridad asistencial del Ministerio de Salud (MINSAL).</li><li>Prevenir reservas duplicadas, fraudes y garantizar la disponibilidad real de los boxes de atención.</li></ul><p>No comercializamos ni transferimos datos personales a terceros bajo ninguna circunstancia ajena a la prestación de servicios del centro.</p></section>
        <section><h2>4. Conservación y seguridad de la información</h2><p>Los datos se resguardan bajo estrictas medidas de seguridad técnica y organizativa inspiradas en las mejores prácticas de la norma ISO/IEC 27001 (cifrado en tránsito HTTPS/TLS, tokens de gestión aleatorios criptográficamente seguros y control de accesos por roles clínicos).</p></section>
        <section><h2>5. Tus derechos como paciente y titular de datos</h2><p>En conformidad con la Ley N.º 19.628 y la Ley N.º 20.584, puedes ejercer tus derechos de acceso, rectificación, cancelación u oposición escribiendo a nuestro canal oficial de WhatsApp al <a href="https://wa.me/56979655129">+56 9 7965 5129</a> o al correo institucional de la clínica.</p></section>
        <section><h2>6. Marco legal aplicable</h2><p>El tratamiento de datos y la atención en Bellabel se rigen estrictamente por la legislación chilena:</p><ul><li><b>Ley N.º 20.584:</b> Regula los Derechos y Deberes que tienen las personas en relación con acciones vinculadas a su atención en salud.</li><li><b>Ley N.º 19.628:</b> Sobre Protección de la Vida Privada y Tratamiento de Datos Personales.</li><li><b>Código Sanitario (DFL 725) y Decretos MINSAL:</b> Normativa sanitaria para establecimientos y prestaciones de salud.</li><li><b>Ley N.º 19.496:</b> Sobre Protección de los Derechos de los Consumidores.</li></ul></section>
        <p className="legal-note">Esta política rige el agendamiento y atención en Bellabel. Los consentimientos informados clínicos específicos para cada procedimiento se suscriben previo a la realización de la sesión.</p>
      </article>
    </main>
  );
}
