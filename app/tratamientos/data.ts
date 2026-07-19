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
    title: "Resultados sutiles que respetan tus rasgos",
    summary: "Evaluación personalizada y procedimientos como toxina botulínica o ácido hialurónico, indicados de forma responsable para mantener la expresividad y armonía del rostro.",
    image: "/images/servicios-biobelle.jpg",
    duration: "45–60 minutos",
    price: "Según evaluación",
    suitableFor: ["Líneas de expresión", "Armonía y proporción facial", "Hidratación o definición de zonas seleccionadas"],
    includes: ["Evaluación facial y antecedentes", "Plan personalizado", "Indicaciones previas y posteriores", "Control según procedimiento"],
    considerations: ["La indicación final depende de la evaluación profesional", "Los resultados y su duración varían entre personas", "Algunos procedimientos pueden requerir controles o sesiones adicionales"],
  },
  {
    slug: "piel",
    eyebrow: "Dermoestética",
    title: "Una piel cuidada desde sus necesidades reales",
    summary: "Protocolos de limpieza facial profesional, Dermapen y cuidado dermoestético seleccionados según textura, luminosidad, sensibilidad y objetivos de cada piel.",
    image: "/images/catalogo-tratamientos.jpg",
    duration: "60–75 minutos",
    price: "Desde $35.000",
    suitableFor: ["Opacidad o textura irregular", "Poros y acumulación de impurezas", "Rutinas de cuidado que necesitan orientación profesional"],
    includes: ["Análisis inicial de la piel", "Protocolo adaptado", "Recomendaciones de cuidado domiciliario", "Plan de continuidad cuando corresponda"],
    considerations: ["No todos los activos o técnicas son adecuados para todas las pieles", "Informa alergias, tratamientos dermatológicos y medicamentos", "Evita iniciar productos intensivos sin indicación previa"],
  },
  {
    slug: "laser",
    eyebrow: "Tecnología láser",
    title: "Precisión clínica para objetivos específicos",
    summary: "Evaluación y protocolos con Nd:YAG Q-Switched para Hollywood Peel, pigmentación seleccionada y eliminación progresiva de tatuajes.",
    image: "/images/servicios-biobelle.jpg",
    duration: "30–60 minutos",
    price: "Según zona y evaluación",
    suitableFor: ["Tatuajes que se desean atenuar o eliminar", "Objetivos de luminosidad mediante Hollywood Peel", "Pigmentación seleccionada tras evaluación"],
    includes: ["Revisión del fototipo y la zona", "Explicación del número estimado de sesiones", "Protección y protocolo de seguridad", "Indicaciones de cuidado posterior"],
    considerations: ["El número de sesiones depende del pigmento, profundidad y respuesta individual", "La exposición solar puede modificar la fecha del procedimiento", "No todas las lesiones pigmentadas deben tratarse con láser"],
  },
  {
    slug: "regenerativa",
    eyebrow: "Medicina regenerativa",
    title: "Estimula procesos naturales de renovación",
    summary: "Protocolos con plasma rico en plaquetas para objetivos faciales o capilares, siempre precedidos por evaluación clínica y explicación de expectativas realistas.",
    image: "/images/catalogo-tratamientos.jpg",
    duration: "60 minutos",
    price: "Desde $85.000",
    suitableFor: ["Calidad y vitalidad de la piel", "Apoyo en protocolos capilares seleccionados", "Planes de cuidado regenerativo"],
    includes: ["Evaluación de antecedentes", "Toma y preparación del plasma", "Aplicación según protocolo", "Indicaciones y seguimiento"],
    considerations: ["Requiere revisar antecedentes, medicamentos y condiciones de salud", "La respuesta varía entre pacientes", "Puede recomendarse un plan de sesiones"],
  },
  {
    slug: "lesiones",
    eyebrow: "Cuidado clínico",
    title: "Evaluación segura antes de intervenir",
    summary: "Revisión y extracción de lesiones cutáneas seleccionadas, como acrocordones o milliums, solo cuando la evaluación profesional indica que el procedimiento es adecuado.",
    image: "/images/servicios-biobelle.jpg",
    duration: "30–45 minutos",
    price: "Desde $30.000",
    suitableFor: ["Acrocordones previamente evaluados", "Milliums", "Lesiones seleccionadas que requieren orientación"],
    includes: ["Evaluación de la lesión", "Explicación de alternativas", "Procedimiento cuando está indicado", "Cuidados posteriores"],
    considerations: ["Una lesión sospechosa debe ser derivada y no tratada estéticamente", "No se garantiza realizar el procedimiento el mismo día", "Consulta si observas cambios de color, forma, tamaño o sangrado"],
  },
  {
    slug: "corporal",
    eyebrow: "Dermoestética corporal",
    title: "Un plan corporal construido para ti",
    summary: "Evaluación y protocolos corporales, incluyendo técnicas de fibroblast en casos seleccionados, con objetivos claros y una planificación individual.",
    image: "/images/catalogo-tratamientos.jpg",
    duration: "45–75 minutos",
    price: "Plan personalizado",
    suitableFor: ["Objetivos localizados de textura o apariencia", "Personas que buscan un plan progresivo", "Evaluación facial o corporal con técnica fibroblast"],
    includes: ["Evaluación de la zona", "Definición de objetivos realistas", "Plan de sesiones cuando corresponda", "Seguimiento y recomendaciones"],
    considerations: ["La técnica se indica solo en personas y zonas adecuadas", "Puede existir tiempo de recuperación", "Los cuidados posteriores son parte esencial del resultado"],
  },
];

export function getTreatment(slug: string) {
  return treatmentDetails.find((treatment) => treatment.slug === slug);
}
