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

- Agenda online estilo premium, en modal, con flujo por pasos.
- Seleccion de tratamiento, profesional, fecha, hora y datos de paciente.
- Fecha minima de reserva: 10 de agosto de 2026.
- Horarios de atención Lunes a Viernes (60 min cada cita): 08:30, 09:45, 11:00, 12:15, 13:30, 14:45, 16:00 y 17:15.
- Horarios de atención Sábados (60 min cada cita): 08:30, 09:45, 11:00 y 12:15.
- Profesionales visibles: Kiara Moscoso y Pia Orellana con la misma jerarquia
  visual. La opcion sin preferencia existe solo como asignacion secundaria y
  equilibrada, no como tarjeta principal.
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

- Confirmar automaticamente reservas por WhatsApp.
- Enviar recordatorios 24 o 48 horas antes.
- Preguntar si la paciente confirma, cancela o necesita reprogramar.
- Liberar horas cuando alguien cancela.
- Ofrecer horarios alternativos automaticamente.
- Contactar lista de espera cuando se libera una hora.
- Enviar instrucciones previas al tratamiento.
- Enviar cuidados posteriores.
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
- Decidir si se usara OpenAI para respuestas inteligentes o solo reglas
  deterministicas al inicio.

Primera fase recomendada:

- Recordatorios y confirmaciones deterministicas por WhatsApp.
- Estados: enviado, entregado, respondido, confirmado, cancelar, reprogramar.
- Escalamiento manual a recepcion si la respuesta no es clara.

Segunda fase recomendada:

- IA conversacional para entender respuestas naturales.
- Recomendacion automatica de horarios.
- Recuperacion de cancelaciones con lista de espera.

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

### Enfoque recomendado para QuantusChile

- Mantener BIOBELLE como experiencia publica y agenda premium.
- Usar QuantusChile como capa operacional futura para ventas, caja, inventario,
  pagos, reportes y automatizaciones.
- Integrar por API cuando existan reglas reales, usuarios definidos y flujo de
  caja/pagos validado.
- Evitar duplicar datos sensibles: definir una fuente de verdad para pacientes,
  reservas, pagos e historial clinico antes de sincronizar.

## Idea futura obligatoria: pagos online

Esto tambien va si o si, pero aun no esta implementado.

Objetivo: permitir pagos o abonos asociados a la reserva, idealmente para reducir
inasistencias y ordenar la operacion.

Opciones a evaluar:

- Abono para confirmar la hora.
- Pago total anticipado.
- Pago de reserva reembolsable o no reembolsable segun politica.
- Cupones o descuentos de inauguracion.
- Pago presencial registrado manualmente por administracion.

Proveedores posibles en Chile:

- Mercado Pago.
- Flow.
- Transbank Webpay.
- Khipu.

Requisitos antes de implementar pagos:

- Razon social o datos tributarios definidos.
- Cuenta bancaria o cuenta del proveedor creada.
- Politica de reembolso/cancelacion.
- Confirmar si el pago sera por tratamiento o solo reserva/abono.
- Integracion de webhook para marcar pagos como aprobados o fallidos.
- Registro en panel administrativo del estado de pago.

Estados futuros sugeridos:

- Sin pago requerido.
- Pendiente de pago.
- Abono pagado.
- Pagado completo.
- Fallido.
- Reembolsado.

## Ideas futuras premium

- Portal de paciente para ver historial y recomendaciones.
- Ficha clinica mas completa con antecedentes y consentimientos.
- Firma digital de consentimiento informado por tratamiento.
- Encuesta post-atencion.
- Segmentacion de pacientes para campañas responsables.
- Programas o packs de tratamientos.
- Gift cards.
- Landing especial de inauguracion.
- Blog educativo con SEO local.
- Integracion con Instagram para mostrar contenido aprobado.
- Dashboard mensual de ventas, reservas, no-show y tratamientos mas solicitados.

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
