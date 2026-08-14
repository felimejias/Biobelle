"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiBarChart2, FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiLogOut, FiMenu, FiPlus, FiSearch, FiSettings, FiUsers, FiX } from "react-icons/fi";
import type { AdminIdentity } from "../admin-auth";

type Booking = { id: string; confirmationCode: string; treatmentId: string; treatmentName: string; professional: string; appointmentDate: string; appointmentTime: string; patientName: string; phone: string; reminderConsent: boolean; status: string };
type Block = { id: string; professional: string; blockDate: string; startTime: string; endTime: string; reason: string };
type WaitlistEntry = { id: string; name: string; phone: string; treatmentId: string; preferredDate: string | null; professional: string; status: string };
type Client = { name: string; phone: string; visits: number; lastDate: string; treatments: string[] };
type User = { id: string; username: string; name: string; role: string; professional: string | null; active: boolean };
type Note = { id: string; phone: string; note: string; authorEmail: string; createdAt: string };
type AdminTreatment = { id: string; label: string; publicLabel: string; duration: string; price: string; active: boolean; sortOrder: number; professionals: string[] };
type Metrics = { total: number; confirmed: number; pending: number; completed: number; noShow: number; occupancy: number; waiting: number };
type AdminData = { identity: AdminIdentity; bookings: Booking[]; blocks: Block[]; waitlist: WaitlistEntry[]; clients: Client[]; users: User[]; notes: Note[]; treatments: AdminTreatment[]; metrics: Metrics };

const professionals = ["Kiara Moscoso", "Pía Orellana", "Dr. Luis Moscoso"];
const professionalProfiles: Record<string, { image: string; role: string; focus: string }> = {
  "Kiara Moscoso": { image: "/images/kiara-moscoso-clean.png", role: "Enfermera dermoestética · Cosmetóloga", focus: "Armonización · Láser · Dermoestética" },
  "Pía Orellana": { image: "/images/pia-orellana-clean.png", role: "Enfermera dermoestética · Cosmetóloga", focus: "Armonización · Láser · Salud integral" },
  "Dr. Luis Moscoso": { image: "/images/dr-luis-moscoso.jpg", role: "Médico Cirujano Estético · Director Médico", focus: "Medicina Estética · Armonización Facial" },
};
const slots = ["08:30", "09:45", "11:00", "12:15", "13:30", "14:45", "16:00", "17:15"];
const treatments = [["evaluacion", "Evaluación estética personalizada"], ["armonizacion", "Armonización facial"], ["piel", "Evaluación dermoestética"], ["laser", "Tecnología láser"], ["regenerativa", "Medicina regenerativa"], ["lesiones", "Cuidado clínico"], ["corporal", "Dermoestética corporal"]];
const statusLabel: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmada", completed: "Atendida", no_show: "No asistió", cancelled: "Cancelada" };
const roleLabel: Record<string, string> = { general_admin: "Administradora general", location_admin: "Administradora del centro", receptionist: "Recepción", professional: "Profesional", readonly: "Solo lectura" };

function isoDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, amount: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return isoDate(date);
}

function addMonths(value: string, amount: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  return isoDate(date);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`));
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function shortWeekday(value: string) {
  return new Intl.DateTimeFormat("es-CL", { weekday: "short" }).format(new Date(`${value}T12:00:00`)).replace(".", "");
}

function dayNumber(value: string) {
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit" }).format(new Date(`${value}T12:00:00`));
}

function monthCalendarDays(value: string) {
  const selected = new Date(`${value}T12:00:00`);
  const start = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return isoDate(day);
  });
}

function treatmentClass(value: string) {
  return `treatment-${value.replace(/[^a-z0-9_-]/gi, "").toLowerCase()}`;
}

export function AdminDashboard({ initialIdentity, signOutPath }: { initialIdentity: AdminIdentity; signOutPath: string }) {
  const [tab, setTab] = useState("agenda");
  const [date, setDate] = useState(isoDate());
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingModal, setBookingModal] = useState<Booking | "new" | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/?from=${date}&to=${date}`, { cache: "no-store" });
      const result = await response.json() as AdminData & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "No pudimos cargar la agenda.");
      setData(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos cargar la agenda.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const act = async (payload: Record<string, unknown>) => {
    setError("");
    const response = await fetch("/api/admin/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "No pudimos guardar el cambio."); return false; }
    await load();
    return true;
  };

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data?.clients ?? [];
    return (data?.clients ?? []).filter((item) => `${item.name} ${item.phone}`.toLowerCase().includes(query));
  }, [data?.clients, search]);

  const identity = data?.identity ?? initialIdentity;
  const canEdit = ["general_admin", "location_admin", "receptionist", "professional"].includes(identity.role);

  const tabs = [
    ["agenda", "Agenda", <FiCalendar key="agenda" />],
    ["clientes", "Pacientes", <FiUsers key="clients" />],
    ...(identity.role === "professional" ? [] : [["espera", "Lista de espera", <FiClock key="wait" />]]),
    ["reportes", "Resumen", <FiBarChart2 key="reports" />],
    ...(identity.isGeneralAdmin ? [["tratamientos", "Tratamientos", <FiSettings key="treatments" />]] : []),
    ...(identity.isGeneralAdmin ? [["usuarios", "Usuarios", <FiSettings key="users" />]] : []),
  ] as [string, string, React.ReactNode][];

  return (
    <main className="admin-app">
      <aside className={menuOpen ? "admin-sidebar open" : "admin-sidebar"}>
        <button className="admin-sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><FiX /></button>
        <img src="/images/biobelle-lockup.png" alt="BIOBELLE" />
        <div className="admin-location"><span>Centro activo</span><b>Rancagua · Bueras 218</b></div>
        <nav>{tabs.map(([id, label, icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setMenuOpen(false); }}>{icon}<span>{label}</span>{id === "espera" && data?.metrics.waiting ? <small>{data.metrics.waiting}</small> : null}</button>)}</nav>
        <div className="admin-user"><span>{identity.name.slice(0, 1).toUpperCase()}</span><div><b>{identity.name}</b><small>{roleLabel[identity.role] ?? identity.role}</small></div><a href={signOutPath} aria-label="Cerrar sesión"><FiLogOut /></a></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><button className="admin-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><FiMenu /></button><div><p>OPERACIÓN BIOBELLE</p><h1>{tabs.find(([id]) => id === tab)?.[1]}</h1></div><div className="admin-top-actions"><span>Atenciones desde 10 agosto</span>{canEdit && tab === "agenda" && <button onClick={() => setBookingModal("new")}><FiPlus /> Nueva reserva</button>}</div></header>
        {error && <div className="admin-error">{error}<button onClick={() => setError("")}>×</button></div>}
        {loading && !data ? <div className="admin-loading">Preparando la operación del centro…</div> : data && <>
          {tab === "agenda" && <AgendaView date={date} setDate={setDate} data={data} canEdit={canEdit} onBooking={setBookingModal} onBlock={() => setBlockOpen(true)} onDeleteBlock={(id) => void act({ action: "delete_block", id })} />}
          {tab === "clientes" && <ClientsView clients={filteredClients} search={search} setSearch={setSearch} onClient={setClient} />}
          {tab === "espera" && <WaitlistView entries={data.waitlist} onStatus={(id, status) => void act({ action: "update_waitlist", id, status })} />}
          {tab === "reportes" && <ReportsView metrics={data.metrics} bookings={data.bookings} />}
          {tab === "tratamientos" && <TreatmentsView treatments={data.treatments} onAction={act} />}
          {tab === "usuarios" && <UsersView users={data.users} onAction={act} />}
        </>}
      </section>

      {bookingModal && <BookingEditor booking={bookingModal} defaultDate={date} identity={identity} treatments={data?.treatments ?? []} onClose={() => setBookingModal(null)} onSave={async (payload) => { const ok = await act(payload); if (ok) setBookingModal(null); }} />}
      {blockOpen && <BlockEditor date={date} identity={identity} onClose={() => setBlockOpen(false)} onSave={async (payload) => { const ok = await act(payload); if (ok) setBlockOpen(false); }} />}
      {client && <ClientPanel client={client} notes={(data?.notes ?? []).filter((note) => note.phone === client.phone)} onClose={() => setClient(null)} onAddNote={async (note) => { const ok = await act({ action: "add_note", phone: client.phone, note }); if (ok) setClient(null); }} />}
    </main>
  );
}

function AgendaView({ date, setDate, data, canEdit, onBooking, onBlock, onDeleteBlock }: { date: string; setDate: (value: string) => void; data: AdminData; canEdit: boolean; onBooking: (booking: Booking) => void; onBlock: () => void; onDeleteBlock: (id: string) => void }) {
  const [selectedProfessional, setSelectedProfessional] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [agendaSearch, setAgendaSearch] = useState("");
  const visibleProfessionals = selectedProfessional === "Todas" ? professionals : professionals.filter((professional) => professional === selectedProfessional);
  const query = agendaSearch.trim().toLowerCase();
  const filteredBookings = data.bookings.filter((item) => item.status !== "cancelled")
    .filter((item) => selectedProfessional === "Todas" || item.professional === selectedProfessional)
    .filter((item) => selectedStatus === "all" || item.status === selectedStatus)
    .filter((item) => !query || `${item.patientName} ${item.phone} ${item.treatmentName} ${item.confirmationCode}`.toLowerCase().includes(query));
  const filteredBlocks = data.blocks.filter((item) => selectedProfessional === "Todas" || item.professional === selectedProfessional);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(date, index - 3));
  const miniDays = monthCalendarDays(date);
  const selectedMonth = new Date(`${date}T12:00:00`).getMonth();
  const legend = [
    ["evaluacion", "Evaluación"],
    ["armonizacion", "Armonización"],
    ["laser", "Tecnología láser"],
    ["piel", "Dermoestética"],
    ["regenerativa", "PRP"],
    ["lesiones", "Clínico"],
  ];
  const statusFilters = [
    ["all", "Todas"],
    ["pending", "Pendientes"],
    ["confirmed", "Confirmadas"],
    ["completed", "Atendidas"],
    ["no_show", "No asistió"],
  ];

  return <div className="admin-content agenda-content">
    <section className="agenda-productbar" aria-label="Módulos operativos BIOBELLE">
      <button className="active"><FiCalendar /> Agenda</button>
      <button className="future">Ventas <small>QuantusChile</small></button>
      <button className="future">Recordatorios <small>Pronto</small></button>
      <button>Pacientes</button>
      <button>Reportes</button>
      <button>Administración</button>
      <span>Agenda médica · Rancagua</span>
    </section>

    <section className="admin-kpis agenda-kpis"><article><span>Reservas del día</span><b>{data.metrics.total}</b><small>{data.metrics.confirmed} confirmadas</small></article><article><span>Ocupación estimada</span><b>{data.metrics.occupancy}%</b><small>Sobre horarios disponibles</small></article><article><span>Pendientes</span><b>{data.metrics.pending}</b><small>Requieren confirmación</small></article><article><span>Lista de espera</span><b>{data.metrics.waiting}</b><small>Solicitudes activas</small></article></section>

    <section className="agenda-workspace">
      <aside className="agenda-filter-panel">
        <div className="agenda-filter-card agenda-search-card">
          <span>Gestión de agenda</span>
          <h3>Reserva, filtra y coordina el día clínico.</h3>
          <label className="agenda-quick-search"><FiSearch /><input value={agendaSearch} onChange={(event) => setAgendaSearch(event.target.value)} placeholder="Buscar paciente, teléfono o tratamiento" /></label>
        </div>
        <div className="agenda-filter-stack" aria-label="Contexto de agenda">
          <div className="agenda-filter-chip"><span>Sucursal</span><b>BIOBELLE Rancagua</b><small>Edificio Olavarría · Oficina 302</small></div>
          <div className="agenda-filter-chip"><span>Agenda</span><b>Agenda médica</b><small>Atenciones desde el 10 de agosto</small></div>
        </div>
        <div className="agenda-filter-group">
          <span>Profesional</span>
          <div className="agenda-segmented professional-segmented" role="group" aria-label="Filtrar por profesional">
            {["Todas", ...professionals].map((option) => <button key={option} className={selectedProfessional === option ? "active" : ""} onClick={() => setSelectedProfessional(option)}>
              {option === "Todas" ? <i className="segment-all">ALL</i> : <img src={professionalProfiles[option].image} alt="" />}
              <b>{option}</b>
            </button>)}
          </div>
        </div>
        <div className="agenda-filter-group">
          <span>Estado de la reserva</span>
          <div className="agenda-status-pills" role="group" aria-label="Filtrar por estado">
            {statusFilters.map(([value, label]) => <button key={value} className={selectedStatus === value ? "active" : ""} onClick={() => setSelectedStatus(value)}>{label}</button>)}
          </div>
        </div>
        <div className="agenda-mini-calendar">
          <div className="mini-calendar-head">
            <button onClick={() => setDate(addMonths(date, -1))} aria-label="Mes anterior"><FiChevronLeft /></button>
            <b>{formatMonth(date)}</b>
            <button onClick={() => setDate(addMonths(date, 1))} aria-label="Mes siguiente"><FiChevronRight /></button>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Elegir fecha" />
          </div>
          <div className="mini-weekdays"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
          <div className="mini-days">{miniDays.map((day) => <button key={day} className={`${day === date ? "active" : ""} ${new Date(`${day}T12:00:00`).getMonth() !== selectedMonth ? "muted" : ""}`} onClick={() => setDate(day)}>{dayNumber(day)}</button>)}</div>
        </div>
        <div className="agenda-legend">
          <span>Colores por tipo de atención</span>
          {legend.map(([id, label]) => <small key={id}><i className={treatmentClass(id)} />{label}</small>)}
        </div>
      </aside>

      <section className="agenda-board">
        <div className="agenda-board-head">
          <div><p>Vista diaria</p><h2>{formatDate(date)}</h2><span>{filteredBookings.length} reservas visibles · {filteredBlocks.length} bloqueos</span></div>
          <div className="agenda-board-actions"><button onClick={() => setDate(addDays(date, -1))} aria-label="Día anterior"><FiChevronLeft /></button><button onClick={() => setDate(isoDate())}>Hoy</button><button onClick={() => setDate(addDays(date, 1))} aria-label="Día siguiente"><FiChevronRight /></button>{canEdit && <button className="block-time" onClick={onBlock}><FiClock /> Bloquear horario</button>}</div>
        </div>
        <div className="agenda-week-strip">{weekDays.map((day) => <button key={day} className={day === date ? "active" : ""} onClick={() => setDate(day)}><span>{shortWeekday(day)}</span><b>{dayNumber(day)}</b></button>)}</div>
        <div className="agenda-grid-shell">
          <section className="agenda-grid agenda-grid-colorful" style={{ gridTemplateColumns: `76px repeat(${visibleProfessionals.length}, minmax(250px, 1fr))` }}>
            <div className="agenda-corner">Hora</div>{visibleProfessionals.map((professional) => {
              const profile = professionalProfiles[professional];
              return <div className="agenda-professional" key={professional}><img src={profile.image} alt={`Foto de ${professional}`} /><div><b>{professional}</b><small>{profile.role}</small><em>{profile.focus}</em></div></div>;
            })}
            {slots.flatMap((time) => [<div className="agenda-time" key={`time-${time}`}>{time}</div>, ...visibleProfessionals.map((professional) => {
              const booking = filteredBookings.find((item) => item.appointmentTime === time && item.professional === professional);
              const block = filteredBlocks.find((item) => item.professional === professional && time >= item.startTime && time < item.endTime);
              return <div className="agenda-slot" key={`${professional}-${time}`}>{booking ? <button className={`booking-pill ${booking.status} ${treatmentClass(booking.treatmentId)}`} onClick={() => onBooking(booking)}><span>{booking.treatmentName}</span><b>{booking.patientName}</b><small>{time} · {statusLabel[booking.status]} · {booking.phone}</small></button> : block ? <div className="blocked-pill"><span>Horario bloqueado</span><b>{block.reason}</b>{canEdit && <button onClick={() => onDeleteBlock(block.id)}>Liberar</button>}</div> : <span className="slot-free"><i />Disponible</span>}</div>;
            })])}
          </section>
        </div>
      </section>
    </section>
  </div>;
}

function ClientsView({ clients, search, setSearch, onClient }: { clients: Client[]; search: string; setSearch: (value: string) => void; onClient: (client: Client) => void }) {
  return <div className="admin-content"><div className="admin-section-head"><div><p>BASE DE PACIENTES</p><h2>Relaciones que continúan.</h2></div><label className="admin-search"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o WhatsApp" /></label></div><div className="admin-table clients-table"><div className="table-head"><span>Paciente</span><span>Contacto</span><span>Atenciones</span><span>Última fecha</span><span></span></div>{clients.map((item) => <button className="table-row" key={item.phone} onClick={() => onClient(item)}><span><b>{item.name}</b><small>{item.treatments.slice(0, 2).join(" · ")}</small></span><span>{item.phone}</span><span>{item.visits}</span><span>{item.lastDate.split("-").reverse().join("/")}</span><span>Ver ficha →</span></button>)}{!clients.length && <div className="admin-empty">No encontramos pacientes con esa búsqueda.</div>}</div></div>;
}

function WaitlistView({ entries, onStatus }: { entries: WaitlistEntry[]; onStatus: (id: string, status: string) => void }) {
  return <div className="admin-content"><div className="admin-section-head"><div><p>OPORTUNIDADES DE AGENDA</p><h2>Lista de espera.</h2></div><span>Contacta primero a quienes mejor coincidan con una hora liberada.</span></div><div className="admin-table waitlist-table"><div className="table-head"><span>Paciente</span><span>Preferencia</span><span>Profesional</span><span>Estado</span><span>Acciones</span></div>{entries.map((item) => <div className="table-row" key={item.id}><span><b>{item.name}</b><small>{item.phone}</small></span><span>{item.preferredDate ? item.preferredDate.split("-").reverse().join("/") : "Flexible"}<small>{item.treatmentId}</small></span><span>{item.professional}</span><span className={`wait-status ${item.status}`}>{item.status === "waiting" ? "Esperando" : item.status === "contacted" ? "Contactada" : item.status === "booked" ? "Reservó" : "Cerrada"}</span><span className="table-actions"><a href={`https://wa.me/${item.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a><select value={item.status} onChange={(event) => onStatus(item.id, event.target.value)}><option value="waiting">Esperando</option><option value="contacted">Contactada</option><option value="booked">Reservó</option><option value="closed">Cerrar</option></select></span></div>)}</div></div>;
}

function ReportsView({ metrics, bookings }: { metrics: Metrics; bookings: Booking[] }) {
  const professionalCount = professionals.map((professional) => ({ professional, count: bookings.filter((item) => item.professional === professional && item.status !== "cancelled").length }));
  const max = Math.max(1, ...professionalCount.map((item) => item.count));
  return <div className="admin-content"><div className="admin-section-head"><div><p>RESUMEN OPERATIVO</p><h2>Decisiones con contexto.</h2></div><span>Indicadores calculados desde las reservas reales de BIOBELLE.</span></div><section className="admin-kpis report-kpis"><article><span>Ocupación</span><b>{metrics.occupancy}%</b><small>Capacidad del período</small></article><article><span>Atendidas</span><b>{metrics.completed}</b><small>Procedimientos realizados</small></article><article><span>Inasistencias</span><b>{metrics.noShow}</b><small>Pacientes no presentados</small></article><article><span>Reservas activas</span><b>{metrics.total}</b><small>Sin cancelaciones</small></article></section><section className="report-panel"><h3>Ocupación por profesional</h3>{professionalCount.map((item) => <div className="report-bar" key={item.professional}><span>{item.professional}</span><div><i style={{ width: `${(item.count / max) * 100}%` }} /></div><b>{item.count}</b></div>)}</section></div>;
}

function TreatmentsView({ treatments: catalog, onAction }: { treatments: AdminTreatment[]; onAction: (payload: Record<string, unknown>) => Promise<boolean> }) {
  const [formOpen, setFormOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [publicLabel, setPublicLabel] = useState("");
  const [duration, setDuration] = useState("Según evaluación");
  const [price, setPrice] = useState("Según evaluación");
  const [enabled, setEnabled] = useState<string[]>([...professionals]);

  const toggleEnabled = (professional: string) => setEnabled((current) => current.includes(professional) ? current.filter((item) => item !== professional) : [...current, professional]);

  return <div className="admin-content"><div className="admin-section-head"><div><p>MATRIZ INTELIGENTE</p><h2>Tratamientos y profesionales.</h2></div><button className="admin-primary" onClick={() => setFormOpen(!formOpen)}><FiPlus /> Nuevo tratamiento</button></div>
    <div className="treatment-admin-note"><b>Regla BIOBELLE:</b> cada procedimiento debe tener al menos una profesional habilitada. Si solo una lo realiza, la paciente verá obligatoriamente solo a esa persona en el agendamiento.</div>
    {formOpen && <form className="admin-inline-form treatment-inline-form" onSubmit={async (event) => { event.preventDefault(); if (enabled.length && await onAction({ action: "add_treatment", label, publicLabel: publicLabel || label, duration, price, professionals: enabled })) { setFormOpen(false); setLabel(""); setPublicLabel(""); setDuration("Según evaluación"); setPrice("Según evaluación"); setEnabled([...professionals]); } }}><label>Nombre interno<input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Ej: Rinomodelación" required /></label><label>Nombre público<input value={publicLabel} onChange={(event) => setPublicLabel(event.target.value)} placeholder="Si quieres otro nombre visible" /></label><label>Duración<input value={duration} onChange={(event) => setDuration(event.target.value)} /></label><label>Precio/nota<input value={price} onChange={(event) => setPrice(event.target.value)} /></label><div className="treatment-pro-checkboxes">{professionals.map((professional) => <label key={professional}><input type="checkbox" checked={enabled.includes(professional)} onChange={() => toggleEnabled(professional)} />{professional}</label>)}</div><button disabled={!enabled.length}>Crear tratamiento</button></form>}
    <div className="treatment-matrix">
      <div className="treatment-matrix-head"><span>Tratamiento</span>{professionals.map((professional) => <span key={professional}>{professional}</span>)}<span>Estado</span></div>
      {catalog.map((item) => <div className={item.active ? "treatment-matrix-row" : "treatment-matrix-row inactive"} key={item.id}><div><b>{item.publicLabel || item.label}</b><small>{item.duration} · {item.price}</small></div>{professionals.map((professional) => {
        const checked = item.professionals.includes(professional);
        return <label className="matrix-toggle" key={`${item.id}-${professional}`}><input type="checkbox" checked={checked} onChange={(event) => void onAction({ action: "update_treatment_assignment", treatmentId: item.id, professional, enabled: event.target.checked })} /><span>{checked ? "Lo realiza" : "No lo realiza"}</span></label>;
      })}<button className={item.active ? "matrix-status active" : "matrix-status"} onClick={() => void onAction({ action: "toggle_treatment", treatmentId: item.id, active: !item.active })}>{item.active ? "Activo" : "Oculto"}</button></div>)}
    </div>
  </div>;
}

function UsersView({ users, onAction }: { users: User[]; onAction: (payload: Record<string, unknown>) => Promise<boolean> }) {
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState(""); const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [role, setRole] = useState("receptionist"); const [professional, setProfessional] = useState("Kiara Moscoso");
  return <div className="admin-content"><div className="admin-section-head"><div><p>CONTROL DE ACCESO</p><h2>Usuarios y permisos.</h2></div><button className="admin-primary" onClick={() => setFormOpen(!formOpen)}><FiPlus /> Nuevo usuario</button></div>{formOpen && <form className="admin-inline-form" onSubmit={async (event) => { event.preventDefault(); if (await onAction({ action: "add_user", name, username, password, role, professional })) { setFormOpen(false); setName(""); setUsername(""); setPassword(""); } }}><label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Usuario<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label><label>Clave inicial<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required /></label><label>Rol<select value={role} onChange={(event) => setRole(event.target.value)}><option value="location_admin">Administradora del centro</option><option value="receptionist">Recepción</option><option value="professional">Profesional</option><option value="readonly">Solo lectura</option></select></label>{role === "professional" && <label>Agenda asignada<select value={professional} onChange={(event) => setProfessional(event.target.value)}>{professionals.map((item) => <option key={item}>{item}</option>)}</select></label>}<button>Crear acceso</button></form>}<div className="admin-table users-table"><div className="table-head"><span>Usuario</span><span>Rol</span><span>Agenda</span><span>Estado</span><span></span></div>{users.map((user) => <div className="table-row" key={user.id}><span><b>{user.name}</b><small>{user.username}</small></span><span>{roleLabel[user.role] ?? user.role}</span><span>{user.professional ?? "Todas"}</span><span>{user.active ? "Activo" : "Suspendido"}</span><button onClick={() => void onAction({ action: "toggle_user", id: user.id, active: !user.active })}>{user.active ? "Suspender" : "Activar"}</button></div>)}</div></div>;
}

function BookingEditor({ booking, defaultDate, identity, treatments: catalog, onClose, onSave }: { booking: Booking | "new"; defaultDate: string; identity: AdminIdentity; treatments: AdminTreatment[]; onClose: () => void; onSave: (payload: Record<string, unknown>) => Promise<void> }) {
  const current = booking === "new" ? null : booking;
  const [patientName, setPatientName] = useState(current?.patientName ?? ""); const [phone, setPhone] = useState(current?.phone ?? ""); const [treatmentId, setTreatmentId] = useState(current?.treatmentId ?? "evaluacion"); const [professional, setProfessional] = useState(current?.professional ?? identity.professional ?? professionals[0]); const [date, setDate] = useState(current?.appointmentDate ?? defaultDate); const [time, setTime] = useState(current?.appointmentTime ?? slots[0]); const [status, setStatus] = useState(current?.status ?? "confirmed");
  const treatmentOptions = catalog.length ? catalog.filter((item) => item.active || item.id === treatmentId) : treatments.map(([id, label]) => ({ id, label, publicLabel: label, professionals }));
  const selectedTreatment = treatmentOptions.find((item) => item.id === treatmentId);
  const eligible = selectedTreatment?.professionals?.length ? selectedTreatment.professionals : professionals;
  useEffect(() => {
    if (identity.role === "professional" && identity.professional) setProfessional(identity.professional);
    else if (!eligible.includes(professional)) setProfessional(eligible[0] ?? professionals[0]);
  }, [eligible, identity.professional, identity.role, professional]);
  return <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={(event) => { event.preventDefault(); void onSave(current ? { action: "update_booking", id: current.id, professional, date, time, status } : { action: "create_booking", patientName, phone, treatmentId, professional, date, time, reminderConsent: true }); }}><button type="button" className="admin-modal-close" onClick={onClose}><FiX /></button><p>{current ? current.confirmationCode : "NUEVA RESERVA"}</p><h2>{current ? "Gestionar la cita" : "Reservar para una paciente"}</h2>{!current && <><label>Nombre completo<input value={patientName} onChange={(event) => setPatientName(event.target.value)} required /></label><label>WhatsApp<input value={phone} onChange={(event) => setPhone(event.target.value)} required /></label><label>Tratamiento<select value={treatmentId} onChange={(event) => setTreatmentId(event.target.value)}>{treatmentOptions.map((item) => <option value={item.id} key={item.id}>{item.publicLabel || item.label}</option>)}</select><small>Solo aparecerán profesionales habilitadas para este tratamiento.</small></label></>} {current && <div className="admin-patient-summary"><span>{current.patientName}</span><b>{current.treatmentName}</b><small>{current.phone}</small></div>}<div className="admin-form-grid"><label>Profesional<select value={professional} onChange={(event) => setProfessional(event.target.value)} disabled={identity.role === "professional"}>{eligible.map((item) => <option key={item}>{item}</option>)}</select></label><label>Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Hora<select value={time} onChange={(event) => setTime(event.target.value)}>{slots.map((item) => <option key={item}>{item}</option>)}</select></label>{current && <label>Estado<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="pending">Pendiente</option><option value="confirmed">Confirmada</option><option value="completed">Atendida</option><option value="no_show">No asistió</option><option value="cancelled">Cancelada</option></select></label>}</div><button className="admin-primary">{current ? "Guardar cambios" : "Crear reserva"}</button></form></div>;
}

function BlockEditor({ date, identity, onClose, onSave }: { date: string; identity: AdminIdentity; onClose: () => void; onSave: (payload: Record<string, unknown>) => Promise<void> }) {
  const [professional, setProfessional] = useState(identity.professional ?? professionals[0]); const [startTime, setStartTime] = useState("09:00"); const [endTime, setEndTime] = useState("19:00"); const [reason, setReason] = useState("Bloqueo administrativo");
  return <div className="admin-modal-backdrop"><form className="admin-modal small" onSubmit={(event) => { event.preventDefault(); void onSave({ action: "create_block", professional, date, startTime, endTime, reason }); }}><button type="button" className="admin-modal-close" onClick={onClose}><FiX /></button><p>BLOQUEO DE AGENDA</p><h2>Reservar tiempo interno</h2><label>Profesional<select value={professional} onChange={(event) => setProfessional(event.target.value)} disabled={identity.role === "professional"}>{professionals.map((item) => <option key={item}>{item}</option>)}</select></label><div className="admin-form-grid"><label>Desde<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label><label>Hasta<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label></div><label>Motivo<input value={reason} onChange={(event) => setReason(event.target.value)} /></label><button className="admin-primary">Bloquear horario</button></form></div>;
}

function ClientPanel({ client, notes, onClose, onAddNote }: { client: Client; notes: Note[]; onClose: () => void; onAddNote: (note: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  return <div className="admin-modal-backdrop"><section className="admin-modal client-panel"><button className="admin-modal-close" onClick={onClose}><FiX /></button><p>FICHA DE PACIENTE</p><h2>{client.name}</h2><div className="client-contact"><span>{client.phone}</span><b>{client.visits} atenciones registradas</b><small>Última cita: {client.lastDate.split("-").reverse().join("/")}</small></div><h3>Tratamientos</h3><div className="client-tags">{client.treatments.map((item) => <span key={item}>{item}</span>)}</div><h3>Notas internas</h3><div className="client-notes">{notes.map((item) => <article key={item.id}><p>{item.note}</p><small>{item.authorEmail}</small></article>)}{!notes.length && <span>Sin notas registradas.</span>}</div><form onSubmit={(event) => { event.preventDefault(); void onAddNote(note); }}><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Agregar observación interna…" required /><button className="admin-primary">Guardar nota</button></form></section></div>;
}
