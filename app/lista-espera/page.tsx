"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandSocial } from "../components/BrandSocial";

const treatments = [
  ["evaluacion", "Evaluación personalizada"],
  ["armonizacion", "Armonización facial"],
  ["piel", "Dermocosmética"],
  ["laser", "Tecnología láser"],
  ["regenerativa", "Medicina regenerativa"],
  ["lesiones", "Cuidado clínico"],
  ["corporal", "Dermoestética corporal"],
];

export default function WaitlistPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [treatmentId, setTreatmentId] = useState("evaluacion");
  const [preferredDate, setPreferredDate] = useState("");
  const [professional, setProfessional] = useState("Primera disponible");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get("tratamiento");
    if (preset && treatments.some(([id]) => id === preset)) queueMicrotask(() => setTreatmentId(preset));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/waitlist/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, treatmentId, preferredDate, professional, privacyConsent }),
    });
    const data = await response.json() as { message?: string; error?: string };
    if (!response.ok) setError(data.error ?? "No pudimos guardar tu solicitud.");
    else {
      setMessage(data.message ?? "Solicitud guardada.");
      void fetch("/api/events/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "waitlist_joined", path: "/lista-espera" }), keepalive: true });
    }
    setLoading(false);
  };

  const whatsappText = encodeURIComponent(`Hola BIOBELLE, me uní a la lista de espera para ${treatments.find(([id]) => id === treatmentId)?.[1]}. Mi nombre es ${name}.`);

  return (
    <main className="waitlist-page">
      <div className="announcement">Lista de espera BIOBELLE · Te avisamos cuando se libera una hora</div>
      <header className="site-header treatment-header"><BrandSocial /><Link className="back-home" href="/">← Volver al inicio</Link></header>
      <section className="waitlist-shell">
        <div className="waitlist-copy"><p className="kicker">Disponibilidad inteligente</p><h1>Tu hora ideal puede aparecer antes.</h1><p>Indícanos qué buscas y te contactaremos si se libera un horario compatible. Estar en la lista no confirma una cita ni genera cobros.</p></div>
        {message ? <div className="waitlist-success"><span>✓</span><h2>Ya estás en la lista.</h2><p>{message}</p><a className="whatsapp-confirm" href={`https://wa.me/56979655129?text=${whatsappText}`} target="_blank" rel="noreferrer">Avisar también por WhatsApp</a></div> : <form className="waitlist-form" onSubmit={submit}>
          <label>Nombre completo<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>
          <label>WhatsApp<input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="+56 9 1234 5678" required /></label>
          <label>Tratamiento<select value={treatmentId} onChange={(event) => setTreatmentId(event.target.value)}>{treatments.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
          <label>Profesional<select value={professional} onChange={(event) => setProfessional(event.target.value)}><option>Primera disponible</option><option>Kiara Moscoso</option><option>Pía Orellana</option></select></label>
          <label>Fecha preferida, opcional<input type="date" value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} /></label>
          <label className="checkbox required-consent"><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} /> Acepto el uso de estos datos para gestionar la lista de espera, según la <Link href="/privacidad" target="_blank">Política de Privacidad</Link>.</label>
          {error && <p className="booking-error">{error}</p>}
          <button className="primary" disabled={!name.trim() || !phone.trim() || !privacyConsent || loading}>{loading ? "Guardando…" : "Unirme a la lista"}</button>
        </form>}
      </section>
    </main>
  );
}
