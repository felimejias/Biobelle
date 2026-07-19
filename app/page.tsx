"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrandSocial } from "./components/BrandSocial";

function track(event: string, path = window.location.pathname) {
  void fetch("/api/events/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, path }),
    keepalive: true,
  });
}

type Treatment = {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
  duration: string;
  price: string;
  tone: string;
};

const treatments: Treatment[] = [
  { id: "armonizacion", eyebrow: "Armonización facial", title: "Belleza que respeta tus rasgos", copy: "Evaluación personalizada, toxina botulínica y ácido hialurónico para resultados sutiles y armónicos.", duration: "45–60 min", price: "Evaluación previa", tone: "rose" },
  { id: "piel", eyebrow: "Dermocosmética", title: "Una piel luminosa y saludable", copy: "Limpieza facial profesional, Dermapen y protocolos regenerativos según las necesidades reales de tu piel.", duration: "60–75 min", price: "Desde $35.000", tone: "sand" },
  { id: "laser", eyebrow: "Tecnología láser", title: "Precisión clínica, cambios visibles", copy: "Hollywood Peel, Nd:YAG Q-Switched y eliminación de tatuajes con una indicación responsable.", duration: "30–60 min", price: "Según evaluación", tone: "wine" },
  { id: "regenerativa", eyebrow: "Medicina regenerativa", title: "Activa el potencial de tu piel", copy: "Plasma rico en plaquetas y técnicas de estimulación para rostro, cuello y cuero cabelludo.", duration: "60 min", price: "Desde $85.000", tone: "clay" },
  { id: "lesiones", eyebrow: "Cuidado clínico", title: "Atención segura y cercana", copy: "Evaluación y extracción de acrocordones, milliums y otras lesiones cutáneas seleccionadas.", duration: "30–45 min", price: "Desde $30.000", tone: "pearl" },
  { id: "corporal", eyebrow: "Dermosestética corporal", title: "Cuidado integral, de pies a cabeza", copy: "Fibroblast y protocolos corporales diseñados por profesionales para objetivos específicos.", duration: "45–75 min", price: "Plan personalizado", tone: "blush" },
];

const concerns = [
  { id: "expresion", label: "Líneas de expresión", treatment: "armonizacion" },
  { id: "manchas", label: "Manchas o tatuajes", treatment: "laser" },
  { id: "luminosidad", label: "Luminosidad y textura", treatment: "piel" },
  { id: "regenerar", label: "Regeneración facial o capilar", treatment: "regenerativa" },
  { id: "lesion", label: "Lesiones cutáneas", treatment: "lesiones" },
  { id: "orientacion", label: "No sé qué necesito", treatment: "evaluacion" },
];

type AvailableSlot = {
  time: string;
  available: boolean;
  availableProfessionals: string[];
};

function nextBusinessDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function BrandLockup({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`brand-lockup${compact ? " compact" : ""}${className ? ` ${className}` : ""}`}>
      <img src="/images/biobelle-lockup.png" alt="BIOBELLE Centro Médico Estético" />
      <span className="sr-only">BIOBELLE Centro Médico Estético</span>
    </span>
  );
}

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [concern, setConcern] = useState("orientacion");
  const [professional, setProfessional] = useState("Primera disponible");
  const [date, setDate] = useState(nextBusinessDate);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [reminderConsent, setReminderConsent] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [availability, setAvailability] = useState<AvailableSlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [managementUrl, setManagementUrl] = useState("");

  const recommendedId = concerns.find((item) => item.id === concern)?.treatment ?? "evaluacion";
  const recommended = useMemo(
    () => treatments.find((item) => item.id === recommendedId),
    [recommendedId],
  );

  useEffect(() => {
    if (!bookingOpen || step !== 3 || !date) return;
    const controller = new AbortController();
    queueMicrotask(() => {
      setAvailabilityLoading(true);
      setBookingError("");
    });

    fetch(`/api/availability/?date=${encodeURIComponent(date)}&professional=${encodeURIComponent(professional)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json() as { slots?: AvailableSlot[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "No pudimos consultar las horas.");
        const nextSlots = data.slots ?? [];
        setAvailability(nextSlots);
        const selectedIsAvailable = nextSlots.some((slot) => slot.time === time && slot.available);
        if (!selectedIsAvailable) setTime(nextSlots.find((slot) => slot.available)?.time ?? "");
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setAvailability([]);
          setTime("");
          setBookingError(error.message);
        }
      })
      .finally(() => setAvailabilityLoading(false));

    return () => controller.abort();
  }, [bookingOpen, date, professional, step, time]);

  const openBooking = (preset?: string) => {
    if (preset) {
      const match = concerns.find((item) => item.treatment === preset);
      if (match) setConcern(match.id);
    }
    setConfirmed(false);
    setBookingError("");
    setConfirmationCode("");
    setManagementUrl("");
    setStep(1);
    setBookingOpen(true);
    track("booking_started");
  };

  const closeBooking = () => setBookingOpen(false);

  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get("agendar");
    if (preset && treatments.some((item) => item.id === preset)) queueMicrotask(() => openBooking(preset));
  }, []);

  const bookingWhatsAppUrl = `https://wa.me/56979655129?text=${encodeURIComponent(
    `Hola BIOBELLE, acabo de reservar ${recommended?.eyebrow ?? "una evaluación"} para el ${date.split("-").reverse().join("/")} a las ${time}. Código: ${confirmationCode}. Profesional: ${professional}. Mi nombre es ${name}.${managementUrl ? ` Gestionar reserva: ${managementUrl}` : ""}`,
  )}`;

  const submitBooking = async () => {
    setBookingLoading(true);
    setBookingError("");
    try {
      const response = await fetch("/api/bookings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concernId: concern,
          treatmentId: recommended?.id ?? "evaluacion",
          professional,
          date,
          time,
          name,
          phone,
          privacyConsent,
          reminderConsent,
        }),
      });
      const data = await response.json() as {
        booking?: { confirmationCode: string; professional: string; managementUrl: string };
        error?: string;
      };
      if (!response.ok || !data.booking) throw new Error(data.error ?? "No pudimos guardar la reserva.");
      setProfessional(data.booking.professional);
      setConfirmationCode(data.booking.confirmationCode);
      setManagementUrl(data.booking.managementUrl);
      setConfirmed(true);
      track("booking_confirmed");
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "No pudimos guardar la reserva.");
      if (error instanceof Error && /ocup/i.test(error.message)) setStep(3);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <main>
      <div className="announcement">Primera evaluación personalizada · Agenda online disponible 24/7</div>
      <header className="site-header">
        <BrandSocial />
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Navegación principal">
          <a href="#tratamientos" onClick={() => setMenuOpen(false)}>Tratamientos</a>
          <a href="#equipo" onClick={() => setMenuOpen(false)}>Equipo</a>
          <a href="#experiencia" onClick={() => setMenuOpen(false)}>Experiencia</a>
          <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
          <button className="nav-book mobile" onClick={() => openBooking()}>Agendar hora</button>
        </nav>
        <button className="nav-book desktop" onClick={() => openBooking()}>Agendar hora <span>↗</span></button>
        <button className="menu-button" aria-label="Abrir menú" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "×" : "☰"}</button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="kicker">Medicina estética con propósito</p>
          <h1>Tu belleza,<br /><em>en equilibrio.</em></h1>
          <p className="hero-lead">Tratamientos seguros, personalizados y respaldados por profesionales para realzar lo que ya te hace única.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => openBooking()}>Agenda tu evaluación <span>↗</span></button>
            <a className="text-link" href="#tratamientos">Explorar tratamientos <span>↓</span></a>
          </div>
          <div className="hero-proof">
            <div className="avatars"><span>K</span><span>P</span><span>♥</span></div>
            <p><b>Atención profesional y cercana</b><small>Protocolos diseñados para ti</small></p>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/images/identidad-biobelle.jpg" alt="Identidad visual de BIOBELLE Centro Médico Estético" />
          <div className="floating-card"><span>✦</span><p><small>Nuestra filosofía</small><b>Resultados naturales,<br />siempre.</b></p></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Atributos BIOBELLE">
        <span>✦ Atención profesional</span><span>✦ Tecnología certificada</span><span>✦ Planes personalizados</span><span>✦ Acompañamiento post tratamiento</span>
      </section>

      <section className="intro" id="experiencia">
        <p className="section-number">01 / EXPERIENCIA BIOBELLE</p>
        <div>
          <h2>Menos excesos.<br /><em>Más tú.</em></h2>
          <p>Creemos en una estética consciente: escuchar primero, indicar solo lo necesario y acompañarte en cada etapa. Porque un resultado realmente bello comienza con confianza.</p>
          <a href="#equipo" className="line-link">Conoce nuestra forma de cuidar <span>→</span></a>
        </div>
        <figure className="intro-image"><img src="/images/biobelle-recepcion.jpg" alt="Recepción y logotipo BIOBELLE" /><figcaption>Rancagua · Atención con cita previa</figcaption></figure>
      </section>

      <section className="treatments" id="tratamientos">
        <div className="section-head">
          <div><p className="section-number">02 / TRATAMIENTOS</p><h2>Diseñados para <em>tu historia.</em></h2></div>
          <p>No necesitas saber el nombre de un procedimiento. Cuéntanos qué quieres mejorar y te orientaremos con honestidad.</p>
        </div>
        <div className="treatment-grid">
          {treatments.map((item, index) => (
            <article className={`treatment-card ${item.tone}`} key={item.id}>
              <span className="card-index">0{index + 1}</span>
              <p className="eyebrow">{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <div className="treatment-meta"><span>{item.duration}</span><span>{item.price}</span></div>
              <div className="treatment-actions"><Link href={`/tratamientos/${item.id}`}>Ver detalles <span>→</span></Link><button onClick={() => openBooking(item.id)} aria-label={`Agendar ${item.eyebrow}`}>Agendar <span>↗</span></button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="smart-booking">
        <div>
          <p className="section-number light">AGENDA INTELIGENTE</p>
          <h2>No elijas a ciegas.<br /><em>Te ayudamos a decidir.</em></h2>
          <p>En menos de 60 segundos identificamos tu objetivo, te sugerimos el tipo de evaluación adecuada y mostramos las horas más convenientes.</p>
          <button className="cream-button" onClick={() => openBooking()}>Encontrar mi tratamiento <span>→</span></button>
        </div>
        <div className="booking-preview">
          <div className="preview-top"><span>✦ Recomendación personalizada</span><b>1 min</b></div>
          <h3>¿Qué te gustaría mejorar?</h3>
          <div className="preview-options"><span>Líneas de expresión</span><span>Manchas</span><span className="active">Luminosidad y textura ✓</span><span>No estoy segura</span></div>
          <div className="recommendation"><span>Tu mejor primer paso</span><b>Evaluación dermocosmética</b><small>40 min · con Kiara o Pía</small></div>
        </div>
      </section>

      <section className="team" id="equipo">
        <div className="section-head">
          <div><p className="section-number">03 / NUESTRO EQUIPO</p><h2>Profesionales que<br /><em>sí te escuchan.</em></h2></div>
          <p>Formación clínica, actualización constante y una mirada humana para recomendar solo aquello que aporte a tu bienestar.</p>
        </div>
        <div className="team-grid">
          <Link className="team-card" href="/equipo/kiara-moscoso">
            <img src="/images/kiara-moscoso.jpg" alt="EU. Kiara Moscoso Villegas, enfermera dermoestética y cosmetóloga" />
            <div><p>Enfermera dermoestética · Cosmetóloga</p><h3>Kiara Moscoso V.</h3><span>Armonización · Láser · Dermocosmética · Ver perfil →</span></div>
          </Link>
          <Link className="team-card" href="/equipo/pia-orellana">
            <img src="/images/pia-orellana.jpg" alt="EU. Pía Orellana, enfermera dermoestética y cosmetóloga" />
            <div><p>Enfermera dermoestética · Cosmetóloga</p><h3>Pía Orellana G.</h3><span>Armonización · Láser · Salud integral · Ver perfil →</span></div>
          </Link>
        </div>
      </section>

      <section className="journey">
        <p className="section-number">04 / TU EXPERIENCIA</p>
        <h2>Una experiencia clara,<br /><em>de principio a fin.</em></h2>
        <div className="journey-steps">
          <article><span>01</span><h3>Cuéntanos tu objetivo</h3><p>Nuestra agenda inteligente te orienta sin tecnicismos.</p></article>
          <article><span>02</span><h3>Evalúa con una profesional</h3><p>Revisamos antecedentes, expectativas y alternativas.</p></article>
          <article><span>03</span><h3>Recibe tu plan</h3><p>Indicaciones, presupuesto y tiempos, todo explicado.</p></article>
          <article><span>04</span><h3>Seguimos contigo</h3><p>Recordatorios y cuidado post-tratamiento por WhatsApp.</p></article>
        </div>
      </section>

      <section className="gallery">
        <div className="gallery-copy"><p className="section-number light">CONOCE BIOBELLE</p><h2>Una marca creada<br />para <em>cuidarte.</em></h2><p>Consulta nuestro catálogo y descubre un espacio donde salud, estética y trato cercano se encuentran.</p></div>
        <img src="/images/catalogo-tratamientos.jpg" alt="Catálogo de tratamientos dermoestéticos BIOBELLE" />
        <img src="/images/servicios-biobelle.jpg" alt="Servicios e información de ubicación BIOBELLE" />
      </section>

      <section className="faq">
        <div><p className="section-number">05 / PREGUNTAS FRECUENTES</p><h2>Antes de tu<br /><em>primera visita.</em></h2></div>
        <div className="faq-list">
          <details open><summary>¿Necesito saber qué tratamiento agendar?<span>+</span></summary><p>No. Puedes elegir “No sé qué necesito” y agendar una evaluación. Definiremos contigo la alternativa más adecuada.</p></details>
          <details><summary>¿Cómo me preparo para mi cita?<span>+</span></summary><p>Al confirmar recibirás indicaciones específicas. En general, evita maquillaje intenso y trae información sobre medicamentos o tratamientos previos.</p></details>
          <details><summary>¿Los resultados son inmediatos?<span>+</span></summary><p>Depende del procedimiento. Te explicaremos resultados esperables, evolución y cuidados antes de que tomes una decisión.</p></details>
          <details><summary>¿Puedo cambiar o cancelar mi hora?<span>+</span></summary><p>Sí. Podrás gestionarla desde el enlace de confirmación o contactarnos por WhatsApp con anticipación.</p></details>
        </div>
      </section>

      <section className="final-cta" id="contacto">
        <div><p className="section-number light">TU PRÓXIMO PASO</p><h2>Comienza por una<br /><em>conversación.</em></h2><p>Agenda tu evaluación personalizada y descubre qué tiene sentido para ti.</p><button className="cream-button" onClick={() => openBooking()}>Agendar mi evaluación <span>↗</span></button></div>
        <div className="contact-card">
          <p><span>Ubicación</span><b>Bueras 218, Edificio Olavarría<br />Oficina 302, Rancagua</b></p>
          <p><span>Contacto</span><b>+56 9 7965 5129<br />+56 9 6406 1984</b></p>
          <p><span>Redes</span><b>@biobelle_center</b></p>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#inicio" aria-label="BIOBELLE inicio"><BrandLockup /></a>
        <p>Belleza natural. Cuidado profesional.</p>
        <div><a href="#tratamientos">Tratamientos</a><a href="#equipo">Equipo</a><a href="https://instagram.com/biobelle_center">Instagram</a><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></div>
        <small>© 2026 BIOBELLE · Información referencial. Todo procedimiento requiere evaluación profesional.</small>
      </footer>

      <a className="whatsapp" href={`https://wa.me/56979655129?text=${encodeURIComponent("Hola BIOBELLE, quisiera recibir orientación sobre sus tratamientos y disponibilidad.")}`} target="_blank" rel="noreferrer" aria-label="Contactar BIOBELLE por WhatsApp">◉</a>

      {bookingOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) closeBooking(); }}>
          <section className="booking-modal" role="dialog" aria-modal="true" aria-label="Agenda inteligente BIOBELLE">
            <button className="modal-close" onClick={closeBooking} aria-label="Cerrar agenda">×</button>
            {!confirmed ? (
              <>
                <div className="modal-header">
                  <BrandLockup compact />
                  <div><p>AGENDA INTELIGENTE</p><h2>{step === 1 ? "Partamos por ti" : step === 2 ? "Tu mejor primer paso" : step === 3 ? "Elige tu hora" : "Confirma tus datos"}</h2></div>
                </div>
                <div className="progress"><span style={{ width: `${step * 25}%` }} /></div>
                {step === 1 && <div className="booking-step"><p>¿Qué te gustaría mejorar o cuidar?</p><div className="concern-grid">{concerns.map((item) => <button className={concern === item.id ? "selected" : ""} onClick={() => setConcern(item.id)} key={item.id}>{item.label}<span>{concern === item.id ? "✓" : "→"}</span></button>)}</div></div>}
                {step === 2 && <div className="booking-step"><p>Según tu objetivo, te recomendamos comenzar por:</p><div className="result-card"><span>RECOMENDACIÓN BIOBELLE</span><h3>{recommended ? recommended.eyebrow : "Evaluación estética personalizada"}</h3><p>{recommended ? recommended.copy : "Una conversación clínica para entender tu piel, tus expectativas y recomendarte opciones seguras."}</p><div><b>{recommended?.duration ?? "40 min"}</b><b>{recommended?.price ?? "Sin compromiso"}</b></div></div><p className="disclaimer">Esta orientación no reemplaza una evaluación clínica. La indicación final siempre será realizada por una profesional.</p></div>}
                {step === 3 && <div className="booking-step schedule-step"><label>Profesional<select value={professional} onChange={(e) => setProfessional(e.target.value)}><option>Primera disponible</option><option>Kiara Moscoso</option><option>Pía Orellana</option></select></label><label>Fecha<input type="date" min={nextBusinessDate()} value={date} onChange={(e) => setDate(e.target.value)} /></label><p>Horas disponibles en tiempo real</p>{availabilityLoading ? <div className="availability-status">Consultando agenda…</div> : availability.length ? <div className="time-grid">{availability.map((slot) => <button type="button" className={time === slot.time ? "selected" : ""} disabled={!slot.available} onClick={() => setTime(slot.time)} key={slot.time}>{slot.time}{!slot.available && <small>Ocupada</small>}</button>)}</div> : <div className="availability-status">No hay horas disponibles para esta fecha.<Link href={`/lista-espera?tratamiento=${recommended?.id ?? "evaluacion"}`}>Unirme a la lista de espera →</Link></div>}<small>✦ Las horas se bloquean al confirmar para evitar reservas duplicadas.</small></div>}
                {step === 4 && <div className="booking-step details-step"><div className="booking-summary"><span>{date.split("-").reverse().join("/")} · {time}</span><b>{recommended?.eyebrow ?? "Evaluación personalizada"}</b><small>{professional}</small></div><label>Nombre completo<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="name" /></label><label>WhatsApp<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 1234 5678" inputMode="tel" autoComplete="tel" /></label><label className="checkbox"><input type="checkbox" checked={reminderConsent} onChange={(e) => setReminderConsent(e.target.checked)} /> Quiero recibir recordatorios e indicaciones por WhatsApp.</label><label className="checkbox required-consent"><input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)} /> Acepto que BIOBELLE use estos datos para gestionar mi reserva, según la <Link href="/privacidad" target="_blank">Política de Privacidad</Link>.</label></div>}
                {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
                <div className="modal-actions">{step > 1 && <button className="back" onClick={() => setStep(step - 1)} disabled={bookingLoading}>← Volver</button>}<button className="continue" disabled={(step === 3 && (!time || availabilityLoading)) || (step === 4 && (!name.trim() || !phone.trim() || !privacyConsent || bookingLoading))} onClick={() => step < 4 ? setStep(step + 1) : void submitBooking()}>{step === 4 ? (bookingLoading ? "Guardando…" : "Confirmar solicitud") : "Continuar"} <span>→</span></button></div>
              </>
            ) : (
              <div className="confirmation"><div className="checkmark">✓</div><p>HORA RESERVADA · {confirmationCode}</p><h2>Tu momento BIOBELLE comienza aquí.</h2><p>La hora del <b>{date.split("-").reverse().join("/")} a las {time}</b> quedó bloqueada a tu nombre. Conserva tu código de reserva.</p><div className="confirmation-card"><span>{recommended?.eyebrow ?? "Evaluación personalizada"}</span><b>{professional}</b><small>{confirmationCode} · Bueras 218, Oficina 302 · Rancagua</small></div>{managementUrl && <a className="manage-booking-link full" href={managementUrl}>Reprogramar o cancelar mi hora <span>→</span></a>}<a className="whatsapp-confirm full" href={bookingWhatsAppUrl} target="_blank" rel="noreferrer">Enviar confirmación por WhatsApp <span>↗</span></a><button className="modal-done full" onClick={closeBooking}>Listo, cerrar</button></div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
