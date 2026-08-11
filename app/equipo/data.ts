export type Professional = {
  slug: string;
  name: string;
  shortName: string;
  role: string;
  email: string;
  image: string;
  introduction: string;
  philosophy: string;
  areas: { title: string; items: string[] }[];
};

export const professionals: Professional[] = [
  {
    slug: "kiara-moscoso",
    name: "EU. Kiara Moscoso Villegas",
    shortName: "Kiara Moscoso",
    role: "Enfermera dermoestética · Cosmetóloga",
    email: "kiaramoscoso77@gmail.com",
    image: "/images/kiara-moscoso.jpg",
    introduction: "Profesional dedicada a la medicina dermoestética, comprometida con una atención cercana, segura y personalizada para realzar la belleza natural de cada paciente.",
    philosophy: "Creemos en una belleza que no cambia quién eres, sino que resalta tu esencia con seguridad, armonía y cuidado integral de la piel.",
    areas: [
      { title: "Armonización facial", items: ["Toxina botulínica", "Ácido hialurónico", "Plasma rico en plaquetas (PRP)"] },
      { title: "Tecnología láser", items: ["Nd:YAG Q‑Switched", "Hollywood Peel", "Eliminación progresiva de tatuajes"] },
      { title: "Dermoestética", items: ["Fibroblast facial y corporal", "Técnica Dermapen", "Limpieza facial profesional", "Extracción de lesiones cutáneas seleccionadas"] },
      { title: "Procedimientos clínicos", items: ["Toma de electrocardiograma (ECG)", "Curaciones simples y avanzadas", "Administración de medicamentos por vía intravenosa e intramuscular"] },
    ],
  },
  {
    slug: "pia-orellana",
    name: "EU. Pía Orellana G.",
    shortName: "Pía Orellana",
    role: "Enfermera dermoestética · Cosmetóloga",
    email: "piaorellana96@gmail.com",
    image: "/images/pia-orellana.jpg",
    introduction: "Profesional apasionada por el cuidado de la piel y la medicina estética, enfocada en tratamientos seguros y personalizados que mantienen la esencia de cada persona.",
    philosophy: "Cada piel tiene su historia. Nuestro compromiso es cuidarla con ciencia, cercanía y una mirada integral del bienestar.",
    areas: [
      { title: "Armonización facial", items: ["Toxina botulínica", "Ácido hialurónico", "Plasma rico en plaquetas (PRP)"] },
      { title: "Tecnología láser", items: ["Nd:YAG Q‑Switched", "Hollywood Peel", "Eliminación progresiva de tatuajes"] },
      { title: "Dermoestética", items: ["Fibroblast facial y corporal", "Técnica Dermapen", "Limpieza facial profesional", "Extracción de lesiones cutáneas seleccionadas"] },
      { title: "Procedimientos clínicos", items: ["Curaciones simples y avanzadas", "Toma de electrocardiograma (ECG)", "Administración de medicamentos por vía intravenosa e intramuscular"] },
    ],
  },
  {
    slug: "dr-luis-moscoso",
    name: "Dr. Luis Moscoso",
    shortName: "Dr. Luis Moscoso",
    role: "Médico General · Atención Clínica Integral",
    email: "consulta@biobelle.cl",
    image: "/images/dr-luis-moscoso.jpg",
    introduction: "Le damos una calurosa bienvenida al Dr. Luis Moscoso a BIOBELLE Centro Médico - Estético. Médico cirujano enfocado en la atención médica integral, evaluación diagnóstica y supervisión clínica de nuestros pacientes.",
    philosophy: "La medicina con visión humana y rigor técnico es el pilar para garantizar un diagnóstico oportuno y la máxima seguridad en cada tratamiento.",
    areas: [
      { title: "Consulta médica general", items: ["Evaluación clínica integral", "Diagnóstico preventivo", "Orientación en medicina dermoestética"] },
      { title: "Procedimientos médicos", items: ["Evaluación y extracción de lesiones cutáneas", "Supervisión de procedimientos endovenosos e intramusculares", "Indicación electrocardiográfica (ECG)"] },
    ],
  },
];

export function getProfessional(slug: string) {
  return professionals.find((professional) => professional.slug === slug);
}

