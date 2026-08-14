"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { BrandSocial } from "./components/BrandSocial";
import { ProfessionalPicker } from "./components/ProfessionalPicker";
import { BookingCalendarPicker } from "./components/BookingCalendarPicker";
import { generateCalendarLinks, OPENING_DATE, PROFESSIONAL_EMAILS, type ProfessionalName } from "./clinic-config";

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
  { id: "armonizacion", eyebrow: "Armonización facial", title: "Realza tu Belleza", copy: "Ácido Hialurónico · Toxina Botulínica (Bótox). Evaluación previa personalizada para resultados sutiles y naturales.", duration: "45–60 min", price: "Evaluación previa", tone: "rose" },
  { id: "piel", eyebrow: "Dermoestética", title: "Belleza y Bienestar", copy: "Limpieza facial profesional (Cosmetología) · Fibroblast Facial (Técnica Plasma Pen) · Fibroblast Corporal (Técnica Plasma Pen).", duration: "60–75 min", price: "Según evaluación", tone: "sand" },
  { id: "laser", eyebrow: "Tecnología láser Nd Yag Q Switched", title: "Precisión clínica, cambios visibles", copy: "Hollywood Peel · Eliminación de tatuajes con tecnología láser Nd:YAG Q-Switched.", duration: "30–60 min", price: "Según evaluación", tone: "wine" },
  { id: "regenerativa", eyebrow: "Medicina regenerativa", title: "Activa el potencial de tu piel", copy: "Plasma rico en plaquetas (PRP) · Técnicas de estimulación para rostro, cuello y cuero cabelludo.", duration: "60 min", price: "Según evaluación", tone: "clay" },
  { id: "lesiones", eyebrow: "Atención Clínica", title: "Atención integral salud y bienestar", copy: "Evaluación y extracción lesiones cutáneas (Acrocordones, milliums, Verrugas y lentigos solares).", duration: "30–45 min", price: "25% dcto acrocordones", tone: "pearl" },
  { id: "atencion-medica", eyebrow: "Atención clínica y Consulta médica", title: "Cuidado integral, de pies a cabeza", copy: "Consulta médica personalizada · Administración medicamentos Vía Endovenosa - Intramuscular · Toma de Electrocardiograma · Curación Simple y avanzada", duration: "45–75 min", price: "Plan personalizado", tone: "blush" },
];

const concerns = [
  { id: "hialuronico", label: "Ácido hialurónico", note: "Perfilado, hidratación y volumen facial", treatment: "armonizacion" },
  { id: "botox", label: "Toxina Botulina (Bótox)", note: "Prevención y suavizado de líneas de expresión", treatment: "armonizacion" },
  { id: "prp", label: "Plasma Rico en plaquetas (PRP)", note: "Bioestimulación celular para rostro, cuello y capilar", treatment: "regenerativa" },
  { id: "hollywood-peel", label: "Hollywood peel Láser", note: "Luminosidad, renovación de textura y poros", treatment: "laser" },
  { id: "tatuajes", label: "Borrado de tatuajes Láser", note: "Remoción progresiva de pigmentos con láser Q-Switched", treatment: "laser" },
  { id: "limpieza-facial", label: "Limpieza Facial (Cosmetólogia)", note: "Higiene profunda y renovación dermoestética", treatment: "piel" },
  { id: "fibroblast-facial", label: "Fibroblast Facial", note: "Técnica Plasma Pen para firmeza facial", treatment: "piel" },
  { id: "fibroblast-corporal", label: "Fibroblast Corporal", note: "Técnica Plasma Pen para firmeza corporal", treatment: "piel" },
  { id: "lesiones-cutaneas", label: "Extracción lesiones cutáneas ( Acrocordones - Milliums - Verrugas- lentigos solares)", note: "Evaluación y extracción segura de lesiones cutáneas", treatment: "lesiones" },
  { id: "consulta-medica", label: "Consulta Medicina general", note: "Evaluación médica integral personalizada", treatment: "atencion-medica" },
  { id: "electrocardiograma", label: "Toma electrocardiograma", note: "Examen electrocardiográfico de reposo (ECG)", treatment: "atencion-medica" },
  { id: "medicamentos", label: "Administración de medicamentos ( Via intramuscular - via venosa)", note: "Aplicación endovenosa e intramuscular por profesionales", treatment: "atencion-medica" },
  { id: "curaciones", label: "curación simple - curación avanzada", note: "Cuidado profesional de heridas y cicatrización", treatment: "atencion-medica" },
  { id: "orientacion", label: "Necesito orientación sobre que procedimiento debo realizarme.", note: "Evaluación clínica para orientarte según tus objetivos", treatment: "evaluacion" },
];

type AvailableSlot = {
  time: string;
  available: boolean;
  availableProfessionals: string[];
};

type ClinicTreatmentView = {
  id: string;
  label: string;
  publicLabel: string;
  duration: string;
  price: string;
  professionals: string[];
};

function nextBusinessDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0) date.setDate(date.getDate() + 1);
  const isoStr = date.toISOString().slice(0, 10);
  return isoStr < OPENING_DATE ? OPENING_DATE : isoStr;
}

function getNextBusinessDateStr(currentDateStr: string) {
  const minDate = nextBusinessDate();
  const baseStr = currentDateStr && currentDateStr >= minDate ? currentDateStr : minDate;
  const parts = baseStr.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPrevBusinessDateStr(currentDateStr: string) {
  const minDate = nextBusinessDate();
  if (!currentDateStr || currentDateStr <= minDate) return minDate;
  const parts = currentDateStr.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const res = `${year}-${month}-${day}`;
  return res < minDate ? minDate : res;
}

function formatDisplayDateSpanish(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
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
  const [flyerOpen, setFlyerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [concern, setConcern] = useState("orientacion");
  const [selectedTreatmentId, setSelectedTreatmentId] = useState("evaluacion");
  const [professional, setProfessional] = useState("");
  const [date, setDate] = useState(nextBusinessDate);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [reminderConsent, setReminderConsent] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [availability, setAvailability] = useState<AvailableSlot[]>([]);
  const [clinicTreatments, setClinicTreatments] = useState<ClinicTreatmentView[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [managementUrl, setManagementUrl] = useState("");

  const recommendedId = selectedTreatmentId || concerns.find((item) => item.id === concern)?.treatment || "evaluacion";
  const clinicTreatment = clinicTreatments.find((item) => item.id === recommendedId);
  const eligibleProfessionals = clinicTreatment?.professionals ?? ["Kiara Moscoso", "Pía Orellana", "Dr. Luis Moscoso"];
  const recommended = useMemo(() => {
    const marketing = treatments.find((item) => item.id === recommendedId);
    if (marketing) return marketing;
    if (!clinicTreatment) return undefined;
    return {
      id: clinicTreatment.id,
      eyebrow: clinicTreatment.publicLabel,
      title: clinicTreatment.publicLabel,
      copy: "Procedimiento agregado por BIOBELLE. La indicación definitiva se confirma durante la evaluación profesional.",
      duration: clinicTreatment.duration,
      price: clinicTreatment.price,
      tone: "pearl",
    };
  }, [clinicTreatment, recommendedId]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/treatments/", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as { treatments?: ClinicTreatmentView[] };
        if (response.ok && data.treatments?.length) setClinicTreatments(data.treatments);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const treatmentId = concerns.find((item) => item.id === concern)?.treatment ?? "evaluacion";
    setSelectedTreatmentId(treatmentId);
  }, [concern]);

  useEffect(() => {
    if (eligibleProfessionals.length === 1) setProfessional(eligibleProfessionals[0]);
    else if (!professional || !eligibleProfessionals.includes(professional)) {
      setProfessional(eligibleProfessionals[0] ?? "Kiara Moscoso");
    }
  }, [eligibleProfessionals, professional]);

  useEffect(() => {
    if (!bookingOpen || step !== 4 || !date) return;
    const controller = new AbortController();
    queueMicrotask(() => {
      setAvailabilityLoading(true);
      setBookingError("");
    });

    fetch(`/api/availability/?date=${encodeURIComponent(date)}&treatmentId=${encodeURIComponent(recommendedId)}&professional=${encodeURIComponent(professional)}`, {
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
  }, [bookingOpen, date, professional, recommendedId, step, time]);

  const openBooking = (preset?: string) => {
    if (preset) {
      const match = concerns.find((item) => item.treatment === preset);
      if (match) setConcern(match.id);
      setSelectedTreatmentId(preset);
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
    if (preset && (treatments.some((item) => item.id === preset) || concerns.some((item) => item.id === preset))) {
      queueMicrotask(() => openBooking(preset));
    }
  }, []);

  const bookingWhatsAppUrl = `https://wa.me/56979655129?text=${encodeURIComponent(
    `Hola BIOBELLE, acabo de reservar ${recommended?.eyebrow ?? "una evaluación"} para el ${date.split("-").reverse().join("/")} a las ${time}. Código: ${confirmationCode}. Profesional: ${professional}. Mi nombre es ${name}.${managementUrl ? ` Gestionar reserva: ${managementUrl}` : ""}`,
  )}`;

  const calendarInfo = useMemo(() => {
    return generateCalendarLinks({
      confirmationCode,
      treatmentName: recommended?.eyebrow ?? "Evaluación personalizada",
      professional,
      date,
      time,
      duration: recommended?.duration,
      patientName: name,
      phone,
    });
  }, [confirmationCode, date, name, phone, professional, recommended?.eyebrow, recommended?.duration, time]);

  const submitBooking = async () => {
    setBookingLoading(true);
    setBookingError("");
    try {
      const response = await fetch("/api/bookings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concernId: concern,
          treatmentId: recommended?.id ?? recommendedId,
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
      if (error instanceof Error && /ocup/i.test(error.message)) setStep(4);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <main>
      <div className="announcement">
        Agenda online abierta · Descuentos de Agosto - Septiembre: 15% extracción acrocordones, 15% Hollywood Peel y 20% cumpleaños · Inauguración oficial 18 de agosto
      </div>
      <header className="site-header">
        <BrandSocial />
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Navegación principal">
          <a href="#tratamientos" onClick={() => setMenuOpen(false)}>Tratamientos</a>
          <a href="#promociones" onClick={() => setMenuOpen(false)}>Descuentos</a>
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
            <p><b>Atención profesional y cercana</b><small>Kiara Moscoso & Pía Orellana</small></p>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/images/identidad-biobelle.jpg" alt="Identidad visual de BIOBELLE Centro Médico Estético" />
          <div className="floating-card"><span>✦</span><p><small>Nuestra filosofía</small><b>Resultados naturales,<br />siempre.</b></p></div>
          <button className="inauguration-badge-btn" onClick={() => setFlyerOpen(true)} title="Ver flyer oficial de inauguración">
            <span className="badge-sparkle">✦</span>
            <span>Inauguración <b>18 de Agosto</b></span>
            <small>Ver flyer oficial →</small>
          </button>
        </div>
      </section>

      <section className="trust-strip" aria-label="Atributos BIOBELLE">
        <span>✦ Atención profesional</span><span>✦ Tecnología certificada</span><span>✦ Planes personalizados</span><span>✦ Acompañamiento post tratamiento</span>
      </section>

      <section className="discounts-banner" id="promociones" aria-label="Descuentos Mes de Agosto - Septiembre">
        <div className="discounts-header">
          <span className="discounts-tag">✦ BENEFICIOS DE TEMPORADA</span>
          <h2>Descuentos Mes de Agosto - Septiembre</h2>
          <p>Disfruta de nuestros descuentos especiales diseñados para renovar y cuidar tu piel en BIOBELLE.</p>
        </div>
        <div className="discounts-grid">
          <div className="discount-card">
            <div>
              <span className="discount-badge">25% DCTO</span>
              <h3>Retiro de Lesiones Cutáneas</h3>
              <p>25% de descuento en retiro de lesiones cutáneas acrocordones con evaluación clínica previa.</p>
            </div>
            <button className="laser-cta" style={{ marginTop: 15 }} onClick={() => openBooking("lesiones")}>Agendar acrocordones ↗</button>
          </div>
          <div className="discount-card">
            <div>
              <span className="discount-badge">15% DCTO</span>
              <h3>Hollywood Peel Láser</h3>
              <p>15% de descuento en tratamiento Hollywood Peel con tecnología Nd:YAG Q-Switched.</p>
            </div>
            <button className="laser-cta" style={{ marginTop: 15 }} onClick={() => openBooking("laser")}>Agendar Hollywood Peel ↗</button>
          </div>
          <div className="discount-card">
            <div>
              <span className="discount-badge">20% DCTO</span>
              <h3>Especial Cumpleaños 🎂</h3>
              <p>20% de descuento en tu día de cumpleaños verificando con carnet en mano al agendar.</p>
            </div>
            <button className="laser-cta" style={{ marginTop: 15 }} onClick={() => openBooking("evaluacion")}>Agendar mi cumpleaños ↗</button>
          </div>
        </div>
      </section>

      <section className="laser-spotlight" aria-labelledby="laser-title">
        <div className="laser-offer">
          <span>Especial apertura</span>
          <b>15%</b>
          <small>dcto Hollywood Peel</small>
        </div>
        <div className="laser-copy">
          <p className="section-number">Tecnología láser BIOBELLE</p>
          <h2 id="laser-title">Nd:YAG Q‑Switched,<br /><em>Hollywood Peel</em> y eliminación de tatuajes.</h2>
          <p>Protocolos láser indicados por profesionales para tratar manchas, textura, luminosidad y remoción de pigmentos con evaluación previa.</p>
        </div>
        <div className="laser-treatments" aria-label="Tratamientos láser destacados">
          <span>Nd:YAG Q‑Switched</span>
          <span>Hollywood Peel</span>
          <span>Eliminación de tatuajes</span>
        </div>
        <button className="laser-cta" onClick={() => openBooking("laser")}>Agendar evaluación láser <span>↗</span></button>
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
          <p>Selecciona tu procedimiento o cuéntanos qué buscas para orientarte con transparencia.</p>
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
          <h3>¿Qué procedimiento buscas?</h3>
          <div className="preview-options"><span>Ácido hialurónico</span><span>Toxina Botulínica</span><span className="active">Hollywood Peel ✓</span><span>Orientación clínica</span></div>
          <div className="recommendation"><span>Tu mejor primer paso</span><b>Evaluación dermoestética</b><small>40 min · con Kiara o Pía</small></div>
        </div>
      </section>

      <section className="team" id="equipo">
        <div className="section-head">
          <div><p className="section-number">03 / NUESTRO EQUIPO</p><h2>Profesionales que<br /><em>sí te escuchan.</em></h2></div>
          <p>Formación clínica, actualización constante y una mirada humana para recomendar solo aquello que aporte a tu bienestar.</p>
        </div>
        <div className="team-grid team-grid-three">
          <Link className="team-card poster-card" href="/equipo/kiara-moscoso">
            <img src="/images/kiara-moscoso.jpg" alt="EU. Kiara Moscoso Villegas, enfermera dermoestética y cosmetóloga" />
            <div><p>Enfermera dermoestética · Cosmetóloga</p><h3>Kiara Moscoso V.</h3><span>kiaramoscoso77@gmail.com · Ver perfil →</span></div>
          </Link>
          <Link className="team-card poster-card" href="/equipo/pia-orellana">
            <img src="/images/pia-orellana.jpg" alt="EU. Pía Orellana, enfermera dermoestética y cosmetóloga" />
            <div><p>Enfermera dermoestética · Cosmetóloga</p><h3>Pía Orellana G.</h3><span>piaorellana96@gmail.com · Ver perfil →</span></div>
          </Link>
          <Link className="team-card doctor-welcome-card" href="/equipo/dr-luis-moscoso">
            <span className="welcome-badge">✦ BIENVENIDO AL EQUIPO</span>
            <img src="/images/dr-luis-moscoso.jpg" alt="Dr. Luis Moscoso, Médico General" />
            <div className="doctor-card-info">
              <p>Médico General · Atención Clínica Integral</p>
              <h3>Dr. Luis Moscoso</h3>
              <small>Disponibilidad y agenda próximamente · Ver perfil →</small>
            </div>
          </Link>
        </div>
      </section>

      <section className="clinical-showcase" id="protocolos-clinicos" aria-labelledby="showcase-title">
        <div className="section-head">
          <div>
            <p className="section-number">03.1 / EN EL BOX CLÍNICO</p>
            <h2 id="showcase-title">Rigor clínico &<br /><em>armonía facial.</em></h2>
          </div>
          <p>
            Registro real de nuestras atenciones. Cada tratamiento se planifica con marcación anatómica exhaustiva y se ejecuta con criterios de enfermería universitaria, asepsia y máxima precisión.
          </p>
        </div>

        <div className="clinical-grid">
          <figure className="clinical-card">
            <img src="/images/procedimiento-diseno-facial.jpg" alt="Diseño y marcación anatómica de vectores faciales por Kiara y Pía" />
            <figcaption>
              <span className="clinical-badge">Diseño & Marcación Anatómica</span>
              <h3>Planificación exhaustiva del tratamiento</h3>
              <p>Evaluación de vectores de tracción, simetría y anatomía facial antes de iniciar cada procedimiento.</p>
            </figcaption>
          </figure>

          <figure className="clinical-card">
            <img src="/images/procedimiento-microinyeccion-precision.jpg" alt="EU. Kiara Moscoso realizando procedimiento de precisión facial" />
            <figcaption>
              <span className="clinical-badge">Técnica de Alta Precisión</span>
              <h3>Microinyecciones & dermoestética</h3>
              <p>Aplicación técnica depurada con insumos certificados para lograr cambios naturales y armónicos.</p>
            </figcaption>
          </figure>

          <figure className="clinical-card">
            <img src="/images/procedimiento-evaluacion-clinica.jpg" alt="Evaluación y atención conjunta por EU. Kiara Moscoso y EU. Pía Orellana" />
            <figcaption>
              <span className="clinical-badge">Atención a Cuatro Manos</span>
              <h3>Criterio clínico compartido</h3>
              <p>Kiara y Pía analizan y coordinan cada indicación en equipo para brindar la máxima seguridad.</p>
            </figcaption>
          </figure>

          <figure className="clinical-card">
            <img src="/images/equipo-clinico-biobelle.jpg" alt="EU. Kiara Moscoso Villegas y EU. Pía Orellana G. equipadas en box clínico" />
            <figcaption>
              <span className="clinical-badge">Seguridad & Protocolo</span>
              <h3>Estándares clínicos de excelencia</h3>
              <p>Profesionales de salud con equipo de protección completo y estrictos protocolos de bioseguridad.</p>
            </figcaption>
          </figure>

          <figure className="clinical-card">
            <img src="/images/equipo-box-atencion.jpg" alt="Equipo BIOBELLE en box clínico acondicionado en Rancagua" />
            <figcaption>
              <span className="clinical-badge">Box Clínico Rancagua</span>
              <h3>Instalaciones privadas & confort</h3>
              <p>Espacio clínico acondicionado en Edificio Olavarría, Oficina 302, pensado exclusivamente para tu privacidad.</p>
            </figcaption>
          </figure>
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
        <img src="/images/servicios-biobelle.jpg" alt="Afiche oficial de inauguración BIOBELLE 18 de Agosto" />
      </section>

      <section className="faq">
        <div><p className="section-number">05 / PREGUNTAS FRECUENTES</p><h2>Antes de tu<br /><em>primera visita.</em></h2></div>
        <div className="faq-list">
          <details open><summary>¿Necesito saber qué tratamiento agendar?<span>+</span></summary><p>No. Puedes elegir la opción 14 ("Necesito orientación") y agendar una evaluación. Definiremos contigo la alternativa más adecuada.</p></details>
          <details><summary>¿Cómo aplico los descuentos de Agosto y Septiembre?<span>+</span></summary><p>Los descuentos del 25% en acrocordones y 15% en Hollywood Peel se aplican automáticamente. Para el 20% de cumpleaños, solo debes mostrar tu carnet de identidad el día de la cita.</p></details>
          <details><summary>¿Cómo le llega la cita a la profesional?<span>+</span></summary><p>Las citas se envían automáticamente al calendario de Kiara Moscoso (kiaramoscoso77@gmail.com) y Pía Orellana (piaorellana96@gmail.com) según la selección de tu profesional.</p></details>
          <details><summary>¿Puedo cambiar o cancelar mi hora?<span>+</span></summary><p>Sí. Podrás gestionarla desde el enlace de confirmación o contactarnos por WhatsApp con anticipación.</p></details>
        </div>
      </section>

      <section className="final-cta" id="contacto">
        <div><p className="section-number light">TU PRÓXIMO PASO</p><h2>Comienza por una<br /><em>conversación.</em></h2><p>Agenda tu evaluación personalizada y descubre qué tiene sentido para ti.</p><button className="cream-button" onClick={() => openBooking()}>Agendar mi evaluación <span>↗</span></button></div>
        <div className="contact-card">
          <p><span>Ubicación</span><b>Bueras 218, Edificio Olavarría<br />Oficina 302, Rancagua</b></p>
          <p><span>Contacto</span><b>+56 9 7965 5129<br />+56 9 6406 1984</b></p>
          <p><span>Emails agenda</span><b>Kiara: kiaramoscoso77@gmail.com<br />Pía: piaorellana96@gmail.com</b></p>
          <p><span>Redes</span><b>@biobelle_center</b></p>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#inicio" aria-label="BIOBELLE inicio"><BrandLockup /></a>
        <p>Belleza natural. Cuidado profesional.</p>
        <div><a href="#tratamientos">Tratamientos</a><a href="#promociones">Descuentos</a><a href="#equipo">Equipo</a><a href="https://instagram.com/biobelle_center">Instagram</a><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></div>
        <small>© 2026 BIOBELLE · Información referencial. Todo procedimiento requiere evaluación profesional.</small>
      </footer>

      <a className="whatsapp" href={`https://wa.me/56979655129?text=${encodeURIComponent("Hola BIOBELLE, quisiera recibir orientación sobre sus tratamientos y disponibilidad.")}`} target="_blank" rel="noreferrer" aria-label="Contactar BIOBELLE por WhatsApp" onClick={() => track("whatsapp_clicked")}><FaWhatsapp aria-hidden="true" /></a>

      {bookingOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) closeBooking(); }}>
          <section className="booking-modal" role="dialog" aria-modal="true" aria-label="Agenda inteligente BIOBELLE">
            <button className="modal-close" onClick={closeBooking} aria-label="Cerrar agenda">×</button>
            {!confirmed ? (
              <>
                <div className="modal-header">
                  <BrandLockup compact />
                  <div>
                    <p>PASO 0{step} · DE 05</p>
                    <h2>
                      {step === 1
                        ? "Comencemos por lo que te importa"
                        : step === 2
                        ? "Una recomendación pensada para ti"
                        : step === 3
                        ? "Elige quién te atenderá"
                        : step === 4
                        ? "Elige tu fecha y hora"
                        : "Los últimos detalles"}
                    </h2>
                  </div>
                </div>
                <div className="opening-note"><span>APERTURA DE AGENDA</span><b>Desde el 18 de agosto</b><small>Atención privada · Rancagua</small></div>
                <div className="progress" aria-label={`Paso ${step} de 5`}><span style={{ width: `${step * 20}%` }} /></div>
                {step === 1 && (
                  <div className="booking-step">
                    <p className="step-intro">Cada experiencia comienza escuchándote.</p>
                    <h3 className="step-question">¿Qué procedimiento buscas?</h3>
                    <div className="concern-grid procedure-grid">
                      {concerns.map((item, index) => (
                        <button className={concern === item.id ? "selected" : ""} onClick={() => setConcern(item.id)} key={item.id}>
                          <span className="concern-number">{String(index + 1).padStart(2, "0")}</span>
                          <span className="concern-copy">
                            <b>{item.label}</b>
                            <small>{item.note}</small>
                          </span>
                          <span className="concern-mark">{concern === item.id ? "✓" : "→"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="booking-step">
                    <p className="step-intro">Tu objetivo merece una indicación honesta.</p>
                    <h3 className="step-question">Este es el mejor lugar para comenzar.</h3>
                    <div className="result-card">
                      <span>CURADURÍA BIOBELLE · RECOMENDACIÓN PERSONALIZADA</span>
                      <h3>{recommended ? recommended.eyebrow : "Evaluación estética personalizada"}</h3>
                      <p>{recommended ? recommended.copy : "Una conversación clínica para entender tu piel, tus expectativas y recomendarte opciones seguras."}</p>
                      <div>
                        <b>{recommended?.duration ?? "40 min"}</b>
                        <b>{recommended?.price ?? "Sin compromiso"}</b>
                      </div>
                    </div>
                    <label className="treatment-select-inline">
                      Tratamiento o procedimiento
                      <select value={selectedTreatmentId} onChange={(event) => setSelectedTreatmentId(event.target.value)}>
                        {(clinicTreatments.length ? clinicTreatments : treatments.map((item) => ({ id: item.id, publicLabel: item.eyebrow, label: item.eyebrow, duration: item.duration, price: item.price, professionals: ["Kiara Moscoso", "Pía Orellana", "Dr. Luis Moscoso"] }))).map((item) => (
                          <option value={item.id} key={item.id}>{item.publicLabel || item.label}</option>
                        ))}
                      </select>
                    </label>
                    <p className="disclaimer">La belleza consciente comienza con una evaluación. La indicación definitiva siempre será realizada por una profesional.</p>
                  </div>
                )}
                {step === 3 && (
                  <div className="booking-step professional-step">
                    <p className="step-intro">El trato humano y profesional que mereces.</p>
                    <h3 className="step-question">¿Quién prefieres que te atienda?</h3>

                    <fieldset className="professional-fieldset">
                      <legend>
                        {eligibleProfessionals.length === 1
                          ? "Profesional habilitada para este tratamiento"
                          : "Toca una profesional para ver sus días y horarios disponibles"}
                      </legend>
                      <ProfessionalPicker
                        value={professional}
                        onChange={(selectedPro) => {
                          setProfessional(selectedPro);
                          setStep(4);
                        }}
                        professionals={eligibleProfessionals}
                        allowNoPreference={eligibleProfessionals.length > 1}
                      />
                    </fieldset>

                    <div className="step-guidance-card">
                      <span className="guidance-icon">✨</span>
                      <div className="guidance-text">
                        <b>{professional ? `Atención con ${professional}` : "Selecciona tu profesional"}</b>
                        <small>Al continuar verás el calendario interactivo con las horas libres de {professional || "tu profesional"}.</small>
                      </div>
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="booking-step schedule-step">
                    <p className="step-intro">Tu tiempo también es parte de la experiencia.</p>
                    <h3 className="step-question">Selecciona tu día y horario de atención.</h3>

                    <div className="selected-pro-banner">
                      <div className="pro-banner-info">
                        <span>Profesional:</span>
                        <b>{professional}</b>
                      </div>
                      {eligibleProfessionals.length > 1 && (
                        <button
                          type="button"
                          className="change-pro-btn"
                          onClick={() => setStep(3)}
                          title="Cambiar profesional"
                        >
                          Cambiar profesional ↺
                        </button>
                      )}
                    </div>

                    <div className="calendar-selection-block">
                      <div className="calendar-block-header">
                        <h4>1. Selecciona el día en el calendario</h4>
                        <span className="selected-date-badge">
                          📅 {formatDisplayDateSpanish(date)}
                        </span>
                      </div>

                      <BookingCalendarPicker
                        selectedDate={date}
                        onSelectDate={(newDate) => {
                          setDate(newDate);
                          setTime("");
                        }}
                        minDate={nextBusinessDate()}
                      />
                    </div>

                    <div className="slots-header-row">
                      <p className="slots-label">2. Horas disponibles para el {formatDisplayDateSpanish(date)}</p>
                      {time && (
                        <span className="selected-time-chip">
                          ✓ Hora seleccionada: <b>{time} hrs</b>
                        </span>
                      )}
                    </div>

                    {availabilityLoading ? (
                      <div className="availability-status loading">
                        <div className="status-spinner" />
                        <span>Consultando disponibilidad en tiempo real…</span>
                      </div>
                    ) : availability.some((slot) => slot.available) ? (
                      <>
                        <div className="time-grid">
                          {availability.map((slot) => (
                            <button
                              type="button"
                              className={time === slot.time ? "selected" : ""}
                              disabled={!slot.available}
                              onClick={() => setTime(slot.time)}
                              key={slot.time}
                            >
                              <span>{slot.time}</span>
                              <small>{slot.available ? "Disponible" : "Ocupada"}</small>
                            </button>
                          ))}
                        </div>
                        {!time && (
                          <div className="time-selection-guide info">
                            <span>👇 <b>Toca una hora disponible arriba</b> para habilitar el botón "Continuar con mis datos".</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="availability-empty-guide">
                        <div className="empty-guide-header">
                          <span className="empty-guide-icon">📅</span>
                          <div>
                            <h4>Sin horas disponibles para este día</h4>
                            <p>
                              No encontramos cupos con <b>{professional || "esta profesional"}</b> para el <b>{formatDisplayDateSpanish(date)}</b>.
                            </p>
                          </div>
                        </div>

                        <div className="empty-guide-box">
                          <p className="guide-title"><b>👉 ¿Cómo deseas continuar?</b></p>
                          <div className="empty-guide-actions">
                            <button
                              type="button"
                              className="btn-guide-next-date"
                              onClick={() => {
                                const nextDate = getNextBusinessDateStr(date);
                                setDate(nextDate);
                                setTime("");
                              }}
                            >
                              📅 Probar siguiente día ({formatDisplayDateSpanish(getNextBusinessDateStr(date))}) →
                            </button>
                            <span className="guide-or-text">o bien</span>
                            <Link
                              className="btn-guide-waitlist"
                              href={`/lista-espera?tratamiento=${recommended?.id ?? recommendedId}`}
                            >
                              📋 Solicitar prioridad en lista de espera →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={`step-action-bar ${time ? "ready" : "pending"}`}>
                      {!availabilityLoading && !availability.some((slot) => slot.available) ? (
                        <span>⚠️ <b>Toca otro día en el calendario ⬆️</b> o presiona "Probar siguiente día".</span>
                      ) : !availabilityLoading && !time ? (
                        <span>👇 <b>Selecciona una hora disponible</b> para continuar al último paso.</span>
                      ) : time ? (
                        <span>✓ Cita a las <b>{time} hrs</b> seleccionada. Presiona "Continuar con mis datos".</span>
                      ) : null}
                    </div>

                    <small className="booking-assurance">✦ Tu hora se reserva exclusivamente para ti al confirmar.</small>
                  </div>
                )}
                {step === 5 && (
                  <div className="booking-step details-step">
                    <p className="step-intro">Estás a un paso de tu experiencia BIOBELLE.</p>
                    <div className="booking-summary">
                      <span>RESUMEN DE TU CITA</span>
                      <b>{recommended?.eyebrow ?? "Evaluación personalizada"}</b>
                      <small>📅 {formatDisplayDateSpanish(date)} · ⏰ {time} hrs · 👩‍⚕️ {professional}</small>
                    </div>

                    <details className="booking-policy-notice" open>
                      <summary>✦ POLÍTICAS DE RESERVA BIOBELLE</summary>
                      <ul>
                        <li><b>Abono de Reserva:</b> Se requiere un abono de <b>$20.000</b> (descontable del valor total del tratamiento).</li>
                        <li><b>Evaluación:</b> Si buscas solo consulta de evaluación, el valor es de <b>$10.000</b> (monto no descontable).</li>
                        <li><b>Confirmación:</b> La hora queda confirmada únicamente tras realizar el depósito/abono.</li>
                        <li><b>Puntualidad:</b> Tolerancia máxima de <b>10 minutos</b>. Avísanos con 24 hrs de anticipación si necesitas reagendar.</li>
                      </ul>
                    </details>

                    <div className="detail-fields">
                      <label>Tu nombre completo<input value={name} onChange={(e) => setName(e.target.value)} placeholder="¿Cómo quieres que te recibamos?" autoComplete="name" /></label>
                      <label>WhatsApp de contacto<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 1234 5678" inputMode="tel" autoComplete="tel" /></label>
                    </div>
                    <label className="checkbox"><input type="checkbox" checked={reminderConsent} onChange={(e) => setReminderConsent(e.target.checked)} /> Deseo recibir recordatorios e indicaciones de preparación por WhatsApp.</label>
                    <label className="checkbox required-consent"><input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)} /> Acepto las <Link href="/terminos" target="_blank">Políticas de Reserva</Link> y la <Link href="/privacidad" target="_blank">Política de Privacidad</Link>.</label>
                  </div>
                )}
                {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
                <div className="modal-actions">
                  <button className="back" onClick={() => (step > 1 ? setStep(step - 1) : closeBooking())} disabled={bookingLoading}>
                    {step > 1 ? "← Volver" : "← Volver al sitio"}
                  </button>
                  <button
                    className="continue"
                    disabled={
                      (step === 1 && !concern) ||
                      (step === 2 && !selectedTreatmentId) ||
                      (step === 3 && !professional) ||
                      (step === 4 && (!time || availabilityLoading)) ||
                      (step === 5 && (!name.trim() || !phone.trim() || !privacyConsent || bookingLoading))
                    }
                    onClick={() => (step < 5 ? setStep(step + 1) : void submitBooking())}
                  >
                    {step === 5
                      ? bookingLoading
                        ? "Reservando tu momento…"
                        : "Reservar mi experiencia"
                      : step === 3
                      ? "Continuar al calendario"
                      : step === 4
                      ? "Continuar con mis datos"
                      : "Continuar con mi selección"}{" "}
                    <span>→</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="confirmation">
                <div className="checkmark">✓</div>
                <p>HORA RESERVADA · {confirmationCode}</p>
                <h2>Tu momento BIOBELLE comienza aquí.</h2>
                <p>La hora del <b>{date.split("-").reverse().join("/")} a las {time}</b> quedó bloqueada a tu nombre. Conserva tu código de reserva.</p>
                <div className="confirmation-card">
                  <span>{recommended?.eyebrow ?? "Evaluación personalizada"}</span>
                  <b>{professional}</b>
                  <small>{confirmationCode} · Bueras 218, Oficina 302 · Rancagua</small>
                </div>

                <div className="calendar-actions">
                  <a className="calendar-btn" href={calendarInfo.googleUrl} target="_blank" rel="noreferrer">
                    📅 Añadir a Google Calendar
                  </a>
                  <a className="calendar-btn" href={calendarInfo.icsUrl} download={`cita-biobelle-${confirmationCode}.ics`}>
                    📥 Descargar Evento (.ics)
                  </a>
                </div>
                <p className="pro-email-notice">
                  Cita agendada para <b>{professional}</b> ({calendarInfo.proEmail})
                </p>

                {managementUrl && <a className="manage-booking-link full" href={managementUrl}>Reprogramar o cancelar mi hora <span>→</span></a>}
                <a className="whatsapp-confirm full" href={bookingWhatsAppUrl} target="_blank" rel="noreferrer">Enviar confirmación por WhatsApp <span>↗</span></a>
                <button className="modal-done full" onClick={closeBooking}>Listo, cerrar</button>
              </div>
            )}
          </section>
        </div>
      )}

      {flyerOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) setFlyerOpen(false); }}>
          <section className="flyer-modal" role="dialog" aria-modal="true" aria-label="Flyer oficial de inauguración BIOBELLE">
            <button className="modal-close" onClick={() => setFlyerOpen(false)} aria-label="Cerrar flyer">×</button>
            <div className="flyer-modal-content">
              <img src="/images/servicios-biobelle.jpg" alt="Flyer oficial de inauguración BIOBELLE - 18 de Agosto" />
              <div className="flyer-modal-actions">
                <button className="primary" onClick={() => { setFlyerOpen(false); openBooking(); }}>
                  Agendar hora de inauguración <span>↗</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

