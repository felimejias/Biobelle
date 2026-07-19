import type { Metadata } from "next";
import Link from "next/link";
import { BrandSocial } from "../components/BrandSocial";

export const metadata: Metadata = {
  title: "Términos de Reserva | BIOBELLE",
  description: "Condiciones generales para solicitar horas y utilizar la información publicada por BIOBELLE.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="announcement">BIOBELLE · Condiciones claras desde el comienzo</div>
      <header className="site-header legal-header"><BrandSocial /><Link className="back-home" href="/">← Volver al inicio</Link></header>
      <article className="legal-document">
        <p>Términos de uso y reserva</p><h1>Una experiencia clara desde el primer contacto.</h1><p className="legal-updated">Última actualización: 19 de julio de 2026</p>
        <section><h2>1. Solicitudes de hora</h2><p>La agenda bloquea el horario seleccionado y entrega un código de reserva. BIOBELLE podrá contactar a la persona para validar información, entregar indicaciones o coordinar cambios necesarios.</p></section>
        <section><h2>2. Evaluación profesional</h2><p>Reservar una hora no garantiza que un procedimiento sea indicado o realizado. Toda prestación estética o clínica depende de la evaluación profesional, antecedentes relevantes, contraindicaciones y consentimiento informado correspondiente.</p></section>
        <section><h2>3. Precios y resultados</h2><p>Los valores publicados como “desde” o “según evaluación” son referenciales. El precio final, número de sesiones, recuperación y resultados esperables se informan individualmente. Los resultados varían entre personas.</p></section>
        <section><h2>4. Cambios y cancelaciones</h2><p>Si necesitas cambiar o cancelar una hora, comunícate cuanto antes al WhatsApp <a href="https://wa.me/56979655129">+56 9 7965 5129</a> e informa tu código de reserva. Las condiciones particulares de abonos y devoluciones se mostrarán antes de implementar pagos en línea.</p></section>
        <section><h2>5. Uso de la información</h2><p>El contenido de biobelle.cl es educativo y no reemplaza una consulta, diagnóstico o indicación profesional. BIOBELLE no presta servicios de urgencia. Ante una emergencia o reacción grave debes acudir al servicio de urgencia correspondiente.</p></section>
        <section><h2>6. Privacidad</h2><p>El tratamiento de datos entregados en la agenda se describe en nuestra <Link href="/privacidad">Política de Privacidad</Link>.</p></section>
      </article>
    </main>
  );
}
