export type TreatmentDetail = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  duration: string;
  price: string;
  suitableFor: string[];
  includes: string[];
  considerations: string[];
};

export const treatmentDetails: TreatmentDetail[] = [
  {
    slug: "armonizacion",
    eyebrow: "Armonización facial",
    title: "Realza tu Belleza",
    summary: "Ácido Hialurónico y Toxina Botulínica (Bótox). Evaluación previa personalizada para lograr un resultado natural, sutil y armónico.",
    image: "/images/servicios-biobelle.jpg",
    duration: "45–60 min",
    price: "Evaluación previa",
    suitableFor: ["Ácido Hialurónico", "Toxina Botulínica (Bótox)", "Líneas de expresión y definición facial"],
    includes: ["Evaluación facial y antecedentes", "Plan personalizado", "Indicaciones previas y posteriores", "Control según procedimiento"],
    considerations: ["La indicación final depende de la evaluación profesional", "Los resultados y su duración varían entre personas", "Algunos procedimientos pueden requerir controles o sesiones adicionales"],
  },
  {
    slug: "piel",
    eyebrow: "Dermoestética",
    title: "Belleza y Bienestar",
    summary: "Limpieza facial profesional (Cosmetología), Fibroblast Facial (Técnica Plasma Pen) y Fibroblast Corporal (Técnica Plasma Pen).",
    image: "/images/catalogo-tratamientos.jpg",
    duration: "60–75 min",
    price: "Según evaluación",
    suitableFor: ["Limpieza facial profesional", "Fibroblast Facial", "Fibroblast Corporal"],
    includes: ["Análisis inicial de la piel", "Protocolo adaptado", "Recomendaciones de cuidado domiciliario", "Plan de continuidad cuando corresponda"],
    considerations: ["No todos los activos o técnicas son adecuados para todas las pieles", "Informa alergias, tratamientos dermatológicos y medicamentos", "Evita iniciar productos intensivos sin indicación previa"],
  },
  {
    slug: "laser",
    eyebrow: "Tecnología láser Nd Yag Q Switched",
    title: "Precisión clínica, cambios visibles",
    summary: "Hollywood Peel y Eliminación de tatuajes. Tecnología de alta precisión para rejuvenecimiento, luminosidad y borrado de pigmentos.",
    image: "/images/servicios-biobelle.jpg",
    duration: "30–60 min",
    price: "Según evaluación (15% dcto Hollywood Peel)",
    suitableFor: ["Hollywood Peel", "Eliminación de tatuajes", "Rejuvenecimiento y tono uniforme"],
    includes: ["Revisión del fototipo y la zona", "Explicación del número estimado de sesiones", "Protección y protocolo de seguridad", "Indicaciones de cuidado posterior"],
    considerations: ["El número de sesiones depende del pigmento, profundidad y respuesta individual", "La exposición solar puede modificar la fecha del procedimiento", "No todas las lesiones pigmentadas deben tratarse con láser"],
  },
  {
    slug: "regenerativa",
    eyebrow: "Medicina regenerativa",
    title: "Activa el potencial de tu piel",
    summary: "Plasma rico en plaquetas (PRP) y técnicas de estimulación para rostro, cuello y cuero cabelludo.",
    image: "/images/catalogo-tratamientos.jpg",
    duration: "60 min",
    price: "Según evaluación",
    suitableFor: ["Plasma rico en plaquetas (PRP)", "Bioestimulación facial y de cuello", "Protocolos capilares regenerativos"],
    includes: ["Evaluación de antecedentes", "Toma y preparación del plasma", "Aplicación según protocolo", "Indicaciones y seguimiento"],
    considerations: ["Requiere revisar antecedentes, medicamentos y condiciones de salud", "La respuesta varía entre pacientes", "Puede recomendarse un plan de sesiones"],
  },
  {
    slug: "lesiones",
    eyebrow: "Atención Clínica",
    title: "Atención integral salud y bienestar",
    summary: "Evaluación y extracción de lesiones cutáneas (Acrocordones, milliums, verrugas y lentigos solares). 25% dcto en retiro de acrocordones.",
    image: "/images/servicios-biobelle.jpg",
    duration: "30–45 min",
    price: "Según evaluación (25% dcto acrocordones)",
    suitableFor: ["Extracción de acrocordones", "Milliums", "Verrugas y lentigos solares"],
    includes: ["Evaluación de la lesión", "Explicación de alternativas", "Procedimiento cuando está indicado", "Cuidados posteriores"],
    considerations: ["Una lesión sospechosa debe ser derivada y no tratada estéticamente", "No se garantiza realizar el procedimiento el mismo día", "Consulta si observas cambios de color, forma, tamaño o sangrado"],
  },
  {
    slug: "atencion-medica",
    eyebrow: "Atención clínica y Consulta médica",
    title: "Cuidado integral, de pies a cabeza",
    summary: "Consulta médica personalizada, Administración de medicamentos Vía Endovenosa e Intramuscular, Toma de Electrocardiograma (ECG), y Curación simple y avanzada.",
    image: "/images/catalogo-tratamientos.jpg",
    duration: "45–75 min",
    price: "Plan personalizado",
    suitableFor: ["Consulta médica personalizada", "Administración de medicamentos EV / IM", "Toma de electrocardiograma (ECG)", "Curaciones simples y avanzadas"],
    includes: ["Evaluación por profesional de salud", "Procedimientos de enfermería y medicina", "Registro y reporte", "Indicaciones de seguimiento"],
    considerations: ["La administración de medicamentos requiere receta médica o indicación profesional", "Evaluación clínica previa obligatoria"],
  },
];

export function getTreatment(slug: string) {
  return treatmentDetails.find((treatment) => treatment.slug === slug);
}
