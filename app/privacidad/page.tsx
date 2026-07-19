import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | BIOBELLE",
  description: "Conoce cómo BIOBELLE utiliza y protege los datos entregados al solicitar una reserva.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="announcement">BIOBELLE · Transparencia y cuidado de tus datos</div>
      <header className="site-header legal-header"><Link className="brand" href="/"><span className="brand-lockup"><img src="/images/biobelle-lockup.png" alt="BIOBELLE Centro Médico Estético" /></span></Link><Link className="back-home" href="/">← Volver al inicio</Link></header>
      <article className="legal-document">
        <p>Privacidad BIOBELLE</p><h1>Tu información merece el mismo cuidado que tú.</h1><p className="legal-updated">Última actualización: 19 de julio de 2026</p>
        <section><h2>1. Responsable y alcance</h2><p>BIOBELLE Centro Médico Estético, ubicado en Bueras 218, Edificio Olavarría, Oficina 302, Rancagua, utiliza los datos entregados en biobelle.cl para administrar solicitudes de hora y comunicaciones relacionadas con la atención.</p></section>
        <section><h2>2. Datos que recopilamos</h2><ul><li>Nombre y número de WhatsApp.</li><li>Tratamiento de interés, profesional, fecha y hora solicitada.</li><li>Consentimiento para recordatorios y registro de la solicitud.</li><li>Información técnica básica necesaria para seguridad y funcionamiento del sitio.</li></ul><p>La agenda web actual no solicita antecedentes clínicos ni fotografías. Si en el futuro fueran necesarios, se pedirán mediante un proceso separado y con información específica.</p></section>
        <section><h2>3. Para qué usamos los datos</h2><ul><li>Comprobar disponibilidad y reservar una hora.</li><li>Contactar a la persona para confirmar, coordinar o modificar la cita.</li><li>Enviar recordatorios e indicaciones cuando se haya autorizado.</li><li>Prevenir reservas duplicadas, abusos y errores operativos.</li></ul><p>No vendemos datos personales ni los utilizamos para finalidades incompatibles con la solicitud realizada.</p></section>
        <section><h2>4. Conservación y proveedores</h2><p>Los datos se conservan durante el tiempo necesario para gestionar la cita, dar seguimiento y cumplir obligaciones aplicables. La infraestructura tecnológica puede procesar información exclusivamente para prestar servicios de alojamiento, seguridad y mensajería a BIOBELLE.</p></section>
        <section><h2>5. Tus opciones y derechos</h2><p>Puedes solicitar información, corrección o eliminación de los datos de reserva escribiendo al WhatsApp <a href="https://wa.me/56979655129">+56 9 7965 5129</a>. Verificaremos tu identidad antes de ejecutar solicitudes que puedan afectar una reserva o información personal.</p></section>
        <section><h2>6. Marco aplicable</h2><p>Esta política considera la Ley N.º 19.628 vigente y se preparará para las modificaciones de la Ley N.º 21.719, cuya entrada en vigencia está prevista para el 1 de diciembre de 2026. Puedes consultar los textos oficiales en la <a href="https://www.bcn.cl/leychile/Navegar?idNorma=141599" target="_blank" rel="noreferrer">Biblioteca del Congreso Nacional</a>.</p></section>
        <p className="legal-note">Esta página describe el tratamiento de datos de la agenda web. Los consentimientos clínicos de cada procedimiento se informan y gestionan por separado.</p>
      </article>
    </main>
  );
}
