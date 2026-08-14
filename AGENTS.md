# BIOBELLE - Estado del proyecto y hoja de ruta

Este archivo resume lo que ya se construyo para BIOBELLE, lo que esta pendiente
de cerrar y las ideas futuras que van si o si, pero que aun no deben tratarse
como implementadas.

## Contexto general

- Marca: BIOBELLE Centro Medico - Estetico.
- Dominio objetivo: `biobelle.cl`.
- Ubicacion comunicada: Bueras 218, Edificio Olavarria, Oficina 302, Rancagua.
- Apertura de agenda y atenciones: desde el 10 de agosto de 2026.
- Estilo visual buscado: premium, minimalista, femenino, clinico y elegante.
- Paleta principal actual: vino/rose, crema, dorado suave y tonos piel.
- Profesionales visibles: Kiara Moscoso y Pia Orellana.
- Tratamientos base: armonizacion facial, toxina botulinica, acido hialuronico,
  PRP, laser Nd:YAG Q-Switched, Hollywood Peel, eliminacion de tatuajes,
  fibroblast, dermapen, limpieza facial profesional, lesiones cutaneas y ECG.

## Ya implementado

- Sitio publico BIOBELLE con direccion visual premium y responsive.
- Logo e imagenes de marca integradas en el sitio.
- Correccion del logo para evitar el cuadro blanco gigante en la cabecera.
- Uso de versiones limpias de las imagenes de Kiara y Pia sin el fondo con letras.
- Hero principal, secciones de tratamientos, equipo, experiencia y contacto.
- Datos visibles de Instagram y WhatsApp junto al logo/marca, no solo como botones.
- Boton flotante de WhatsApp con icono real/identificable.
- Catalogo de tratamientos con rutas publicas por tratamiento.
- Paginas de profesionales con rutas individuales.
- SEO basico, sitemap, robots, metadata local y schema de negocio medico.
- Politica de privacidad y terminos.
- Analitica interna basica sin guardar datos sensibles de pacientes en eventos.

## Agenda implementada

- Agenda online estilo premium, en modal, con flujo guiado de 5 pasos:
  1. Procedimiento o motivo de consulta.
  2. Recomendación y confirmación de tratamiento.
  3. Selección de profesional con tarjetas dedicadas.
  4. Calendario visual mensual interactivo (con selección táctil de días hábiles, navegación de meses, bloqueo de domingos) y grilla de horarios libres en tiempo real.
  5. Datos de contacto, políticas de reserva transparentes y confirmación.
- Fecha minima de reserva: apertura oficial desde el 18 de agosto de 2026.
- Horarios de atención Lunes a Viernes (60 min cada cita): 08:30, 09:45, 11:00, 12:15, 13:30, 14:45, 16:00 y 17:15.
- Horarios de atención Sábados (60 min cada cita): 08:30, 09:45, 11:00 y 12:15.
- Profesionales visibles: Kiara Moscoso, Pía Orellana y Dr. Luis Moscoso.
- Validacion para evitar reservas duplicadas activas en el mismo horario.
- Confirmacion de reserva con codigo.
- Link de gestion de reserva para reprogramar o cancelar.
- Consentimiento de privacidad y consentimiento para recordatorios.
- Lista de espera publica para cuando no haya hora ideal.
- API de disponibilidad que considera reservas y bloqueos administrativos.
- API de disponibilidad que considera tratamiento elegido, profesionales
  habilitadas, reservas y bloqueos administrativos.

## Panel administrativo implementado

- Ruta del panel: `/administracion`.
- Acceso administrativo por usuario y clave, no por correo.
- Usuario inicial de administrador general: `admin`.
- La clave inicial temporal fue definida por el dueno del proyecto y debe
  cambiarse antes de operar con pacientes reales.
- Sesion administrativa por cookie segura HTTP-only.
- Tabla de sesiones administrativas.
- Roles internos:
  - Administrador general.
  - Administradora del centro.
  - Recepcion.
  - Profesional.
  - Solo lectura.
- Permisos por rol para agenda, pacientes, lista de espera, reportes y usuarios.
- Creacion de nuevos usuarios con nombre, usuario, clave inicial, rol y agenda
  asignada si corresponde.
- Activar/suspender usuarios.
- Vista de agenda diaria por profesional.
- Vista administrativa de agenda redisenada con inspiracion AgendaPro:
  - barra superior de modulos operativos.
  - filtros visuales tipo app por sucursal, agenda, profesional, estado y busqueda rapida.
  - selector de profesional con miniaturas reales de Kiara y Pia.
  - filtros de estado por capsulas, evitando desplegables antiguos.
  - mini calendario lateral con navegacion por mes anterior/siguiente.
  - selector semanal.
  - grilla diaria por hora y profesional.
  - reservas con colores por tipo de tratamiento.
  - leyenda visual de tratamientos.
- Crear reservas desde administracion.
- Editar reservas existentes.
- Cambiar estado de reserva: pendiente, confirmada, atendida, no asistio,
  cancelada.
- Bloquear y liberar horarios internos.
- Gestion de lista de espera.
- Ficha de pacientes por telefono.
- Notas internas de pacientes.
- Reportes operativos basicos: reservas, ocupacion, pendientes, atendidas,
  inasistencias y lista de espera.
- Modulo administrativo de tratamientos:
  - agregar nuevos procedimientos.
  - activar u ocultar tratamientos.
  - marcar si Kiara y/o Pia realizan cada tratamiento.
  - impedir que un tratamiento quede sin profesional asignada.
  - filtrar automaticamente la agenda publica segun la matriz tratamiento /
    profesional.

## Infraestructura implementada

- Proyecto web con Next/Vinext para Cloudflare/Sites.
- Persistencia con D1 declarada como `DB`.
- Esquema Drizzle para:
  - `bookings`
  - `waitlist`
  - `site_events`
  - `admin_users`
  - `admin_sessions`
  - `schedule_blocks`
  - `booking_history`
  - `client_notes`
- Migraciones versionadas en `drizzle/`.
- Tests de validacion del sitio y del panel administrativo.
- Build verificado localmente con `npm run build`.
- Test suite verificada con `npm test`.
- Sitio publicado en produccion por Sites y apuntado al dominio `biobelle.cl`.

## Pendiente urgente por implementar

1. Publicar en produccion la version con login por usuario/clave cuando el dueno
   autorice el despliegue publico.
2. Cambiar la clave inicial temporal del usuario `admin` por una clave fuerte.
3. Agregar flujo para cambiar clave desde el panel.
4. Agregar recuperacion o reseteo de clave para usuarios internos.
5. Revisar visualmente el panel `/administracion` en desktop, tablet y movil.
6. Probar el flujo real completo: reservar, ver en panel, editar, cancelar,
   reprogramar y revisar lista de espera.
7. Definir si cada profesional tendra su propio usuario o si recepcion operara
   todas las agendas al inicio.
8. Definir reglas reales de horarios, dias cerrados, feriados y duracion por
   tratamiento.
9. Agregar auditoria mas clara de cambios administrativos en la interfaz.
10. Agregar expiracion/limpieza periodica de sesiones antiguas.

## Pendiente importante

- Correo profesional, idealmente `consulta@biobelle.cl`.
- Definir proveedor de correo: Cloudflare Email Routing, Google Workspace,
  Zoho, Outlook u otro.
- Crear textos finales de contacto, politicas y terminos con revision legal.
- Mejorar textos comerciales de cada tratamiento con enfoque clinico y premium.
- Agregar preguntas frecuentes por tratamiento.
- Agregar contraindicaciones generales y aviso de evaluacion previa.
- Agregar contenido de preparacion previa y cuidados posteriores por tratamiento.
- Agregar fotos reales del centro cuando esten disponibles.
- Agregar galeria antes/despues solo si hay autorizaciones validas.
- Agregar medicion de conversiones: clics a WhatsApp, apertura de agenda,
  reservas completadas y lista de espera.
- Mejorar reportes del panel con filtros por rango de fecha y profesional.
- Exportar reservas/clientes a CSV.
- Agregar notificaciones internas para nuevas reservas.

## Idea futura obligatoria: Bella IA tipo Sofia IA

Esta idea va si o si, pero aun no esta implementada como automatizacion real.
Debe tratarse como una fase futura.

Objetivo: crear una asistente inteligente de BIOBELLE, inspirada en Sofia IA de
AgendaPro, pero propia de la marca. Nombre sugerido: `Bella IA`.

Funciones esperadas:

- Confirmar automaticamente reservas por WhatsApp (24h y 48h antes) con botones interactivos (Confirmar, Reagendar, Cancelar).
- Enviar recordatorios con enlace de gestion rápida.
- Preguntar si la paciente confirma, cancela o necesita reprogramar.
- Liberar horas cuando alguien cancela y ofrecer horarios alternativos.
- **Recuperación activa de lista de espera**: Al liberarse una hora, Bella IA contacta automáticamente por WhatsApp a la primera paciente de la lista de espera interesada en ese tratamiento/horario con confirmación en un clic.
- **Protocolos clínicos pre y post-tratamiento**:
  - Enviar instrucciones previas de preparación según el tratamiento agendado (ej. Láser Q-Switched / Hollywood Peel: evitar sol 48h antes; Bótox/Ácido Hialurónico: evitar anticoagulantes/alcohol).
  - Enviar cuidados posteriores automáticamente cuando la profesional marca la cita como "Atendida" en el panel.
- Detectar cuando una paciente no responde y escalar a recepcion.
- Registrar historial de mensajes en la ficha del paciente.
- Medir confirmaciones, cancelaciones, no-show y recuperacion de horas.
- Mantener tono premium, cercano y clinico.

Requisitos antes de construir Bella IA:

- Cuenta Meta Business configurada.
- WhatsApp Business Platform o proveedor autorizado.
- Numero oficial de WhatsApp de BIOBELLE.
- Plantillas aprobadas para confirmaciones, recordatorios y reprogramaciones.
- Politica de consentimiento clara para recibir mensajes.
- Variables de entorno seguras para tokens/API, nunca en el codigo.

## Idea futura obligatoria: pagos online y validación de abonos

Objetivo: permitir el cobro automatizado de abonos ($20.000 para tratamientos / $10.000 para evaluación) para reducir el No-Show a 0%.

Opciones a integrar:

- Pasarela de pago web (Flow, Mercado Pago o Transbank Webpay Plus).
- Webhook de confirmación instantánea: la reserva pasa de `pending` a `confirmed` automáticamente al aprobarse la transacción.
- Carga de comprobante de transferencia bancaria para validación rápida desde el panel administrativo.
- Registro contable del abono y saldo pendiente a pagar el día de la cita.

## Idea futura obligatoria: consentimientos informados y ficha clínica con firma digital

Objetivo: eliminar papeles y cumplir normativas sanitarias con firma digital y registro fotográfico.

Funciones:

- **Firma digital de consentimiento informado**: La paciente firma con su dedo desde su teléfono o en tablet de recepción antes de la sesión para procedimientos como Bótox, Ácido Hialurónico, Láser Nd:YAG, PRP, Fibroblast, etc.
- **Ficha clínica con galería Antes / Después**: Subida privada de fotografías clínicas para comparar la evolución estética sesión a sesión con comparador visual (*Before/After slider*).
- Historial de procedimientos y dosis aplicadas (ej. unidades de toxina botulínica o ml de ácido hialurónico).

## Idea futura obligatoria: sincronización bidireccional con Google Calendar

Objetivo: mantener la agenda del teléfono de las profesionales y la web 100% sincronizadas en tiempo real.

Funciones:

- Creación automática del evento en el Google Calendar de Kiara (`kiaramoscoso77@gmail.com`), Pía (`piaorellana96@gmail.com`) y Dr. Luis Moscoso al agendarse en la web.
- **Bloqueo bidireccional**: Si la profesional bloquea una hora en el Google Calendar de su teléfono, esa hora se bloquea automáticamente en la web de Biobelle.

## Idea futura obligatoria: motor de reactivación y mantenciones periódicas

Objetivo: fidelizar a las pacientes y asegurar la continuidad de sus tratamientos.

Funciones:

- **Recordatorio automático de mantención de Bótox**: A los 4–5 meses de la aplicación, el sistema envía un mensaje invitando a agendar la mantención de toxina botulínica.
- **Seguimiento de sesiones de Láser / PRP**: Recordatorio a los 30 días para agendar la siguiente sesión del protocolo.
- **Cross-selling estético**: Oferta de tratamientos complementarios (ej. Limpieza facial + Hollywood Peel) con descuentos exclusivos.

## Idea futura obligatoria: dashboard financiero y reporte de comisiones

Objetivo: reportería comercial y operativa para la administración del centro.

Funciones:

- Cálculo automático de ingresos y comisiones por profesional (Kiara, Pía, Dr. Luis).
- Ocupación de boxes y porcentaje de horas utilizadas vs disponibles.
- Reporte de tratamientos más demandados y rentabilidad por procedimiento.

## Idea futura obligatoria: modulo QuantusChile tipo AgendaPro

Esto queda anotado como mejora futura para integrar con QuantusChile. No esta
implementado todavia en BIOBELLE y no debe comunicarse como disponible.

Inspiracion tomada del menu funcional de AgendaPro:

### Captar pacientes

- Agenda online avanzada.
- Reservas online por tratamiento, profesional, sucursal y disponibilidad real.
- Recordatorios automaticos.
- Ficha clinica digital.
- Agenda medica completa.
- Historia clinica.

### Gestionar operacion

- Pago online.
- Control de inventarios.
- Integraciones API.
- Reportes de gestion.
- Reporte de comisiones.
- Sistema de caja.
- Facturacion electronica.
- Maquina POS.
- Boleta de honorarios.
- Ventas internas de tratamientos, packs, productos y abonos.

### Crecer el centro

- Email marketing.
- Encuestas de satisfaccion.
- Fidelizacion de clientes.
- Gift cards.
- Asistente IA comercial/operativa tipo Charly, adaptada a BIOBELLE.

## Reglas de trabajo para futuros agentes

- Mantener el tono premium, minimalista y clinico.
- No introducir cambios visuales grandes sin revisar el sitio completo.
- No guardar claves, tokens ni credenciales en archivos del repositorio.
- No afirmar que WhatsApp IA o pagos estan listos hasta que existan integraciones
  reales, credenciales, webhooks y pruebas.
- Antes de tocar agenda o pagos, revisar `db/schema.ts`, `app/api/bookings`,
  `app/api/admin`, `app/api/availability` y el panel de administracion.
- Si se cambia el esquema D1, generar migracion en `drizzle/` y probar build.
- Ejecutar `npm test` antes de publicar cambios importantes.
- Para publicar, usar el proyecto existente de Sites definido en
  `.openai/hosting.json`; no crear otro sitio.
- El dominio publico debe seguir siendo `biobelle.cl`.
