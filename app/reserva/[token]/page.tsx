"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandSocial } from "../../components/BrandSocial";
import { ProfessionalPicker } from "../../components/ProfessionalPicker";

type Booking = {
  confirmationCode: string;
  treatmentId: string;
  treatmentName: string;
  professional: string;
  date: string;
  time: string;
  patientName: string;
  status: string;
};

type Slot = { time: string; available: boolean };
type ClinicTreatmentView = { id: string; professionals: string[] };

function nextBusinessDate() {
  const openingDate = "2026-08-10";
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10) < openingDate ? openingDate : date.toISOString().slice(0, 10);
}

export default function ReservationPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [professional, setProfessional] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [clinicTreatments, setClinicTreatments] = useState<ClinicTreatmentView[]>([]);

  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      const response = await fetch(`/api/reservations/${token}/`, { cache: "no-store" });
      const data = await response.json() as { booking?: Booking; error?: string };
      if (!response.ok || !data.booking) setError(data.error ?? "No pudimos encontrar la reserva.");
      else {
        setBooking(data.booking);
        setDate(data.booking.date);
        setTime(data.booking.time);
        setProfessional(data.booking.professional);
      }
      setLoading(false);
    };
    const timeout = window.setTimeout(() => void loadBooking(), 0);
    return () => window.clearTimeout(timeout);
  }, [token]);

  useEffect(() => {
    if (!editing || !date) return;
    fetch(`/api/availability/?date=${encodeURIComponent(date)}&treatmentId=${encodeURIComponent(booking?.treatmentId ?? "evaluacion")}&professional=${encodeURIComponent(professional)}`)
      .then((response) => response.json())
      .then((data: { slots?: Slot[] }) => {
        const nextSlots = data.slots ?? [];
        setSlots(nextSlots);
        setTime((currentTime) => nextSlots.some((slot) => slot.time === currentTime && slot.available) ? currentTime : nextSlots.find((slot) => slot.available)?.time ?? "");
      })
      .catch(() => setSlots([]));
  }, [booking?.treatmentId, date, editing, professional]);

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

  const eligibleProfessionals = clinicTreatments.find((item) => item.id === booking?.treatmentId)?.professionals ?? ["Kiara Moscoso", "Pía Orellana", "Dr. Luis Moscoso"];

  const changeBooking = async (action: "cancel" | "reschedule") => {
    if (action === "cancel" && !window.confirm("¿Confirmas que deseas cancelar esta hora?")) return;
    setSaving(true);
    setError("");
    const response = await fetch(`/api/reservations/${token}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, date, time, professional }),
    });
    const data = await response.json() as { booking?: Booking; error?: string };
    if (!response.ok || !data.booking) setError(data.error ?? "No pudimos actualizar la reserva.");
    else {
      setBooking(data.booking);
      setEditing(false);
    }
    setSaving(false);
  };

  return (
    <main className="reservation-page">
      <div className="announcement">Gestión segura de tu reserva BIOBELLE</div>
      <header className="site-header treatment-header"><BrandSocial /><Link className="back-home" href="/">← Volver al inicio</Link></header>
      <section className="reservation-shell">
        {loading ? <div className="reservation-loading">Consultando tu reserva…</div> : error && !booking ? <div className="reservation-empty"><h1>No encontramos esta reserva.</h1><p>{error}</p><a href="https://wa.me/56979655129">Solicitar ayuda por WhatsApp</a></div> : booking && <>
          <div className="reservation-heading"><p>Reserva {booking.confirmationCode}</p><h1>Hola, {booking.patientName.split(" ")[0]}.</h1><span>Aquí puedes revisar, reprogramar o cancelar tu hora sin llamar.</span></div>
          <div className={`reservation-card ${booking.status}`}>
            <div><small>Tratamiento</small><b>{booking.treatmentName}</b></div>
            <div><small>Fecha y hora</small><b>{booking.date.split("-").reverse().join("/")} · {booking.time}</b></div>
            <div><small>Profesional</small><b>{booking.professional}</b></div>
            <span className="reservation-status">{booking.status === "cancelled" ? "Cancelada" : booking.status === "confirmed" ? "Confirmada" : "Pendiente de confirmación"}</span>
          </div>

          {editing && booking.status !== "cancelled" && <div className="reschedule-panel">
            <h2>Elige una nueva hora</h2>
            <fieldset className="professional-fieldset"><legend>{eligibleProfessionals.length === 1 ? "Profesional habilitada" : "Elige quién te atenderá"}</legend><ProfessionalPicker value={professional} onChange={setProfessional} compact professionals={eligibleProfessionals} allowNoPreference={eligibleProfessionals.length > 1} /></fieldset>
            <label>Fecha<input type="date" min={nextBusinessDate()} value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <div className="time-grid">{slots.map((slot) => <button type="button" disabled={!slot.available} className={time === slot.time ? "selected" : ""} onClick={() => setTime(slot.time)} key={slot.time}>{slot.time}</button>)}</div>
            {error && <p className="booking-error">{error}</p>}
            <div className="reservation-actions"><button className="modal-done" onClick={() => setEditing(false)}>Volver</button><button className="continue" disabled={!time || saving} onClick={() => void changeBooking("reschedule")}>{saving ? "Guardando…" : "Confirmar nueva hora"}</button></div>
          </div>}

          {!editing && booking.status !== "cancelled" && <div className="reservation-actions"><button className="reschedule-button" onClick={() => setEditing(true)}>Reprogramar hora</button><button className="cancel-button" disabled={saving} onClick={() => void changeBooking("cancel")}>Cancelar reserva</button></div>}
          {booking.status === "cancelled" && <div className="reservation-cancelled"><p>Esta reserva fue cancelada y la hora quedó disponible nuevamente.</p><Link href="/?agendar=evaluacion">Solicitar una nueva hora</Link></div>}
        </>}
      </section>
    </main>
  );
}
