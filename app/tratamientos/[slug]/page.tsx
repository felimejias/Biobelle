import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandSocial } from "../../components/BrandSocial";
import { getTreatment, treatmentDetails } from "../data";

type TreatmentPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return treatmentDetails.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: TreatmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const treatment = getTreatment(slug);
  if (!treatment) return {};
  return {
    title: `${treatment.eyebrow} en Rancagua | Bellabel`,
    description: treatment.summary,
    alternates: { canonical: `/tratamientos/${slug}` },
    openGraph: { title: `${treatment.eyebrow} | Bellabel`, description: treatment.summary, images: [treatment.image] },
  };
}

export default async function TreatmentPage({ params }: TreatmentPageProps) {
  const { slug } = await params;
  const treatment = getTreatment(slug);
  if (!treatment) notFound();

  const whatsappText = encodeURIComponent(`Hola Bellabel, quisiera orientación y disponibilidad para ${treatment.eyebrow}.`);

  return (
    <main className="treatment-page">
      <div className="announcement">Evaluación personalizada · Atención profesional en Rancagua</div>
      <header className="site-header treatment-header">
        <BrandSocial />
        <Link className="back-home" href="/#tratamientos">← Todos los tratamientos</Link>
      </header>

      <section className="treatment-detail-hero">
        <div>
          <p className="kicker">{treatment.eyebrow}</p>
          <h1>{treatment.title}</h1>
          <p>{treatment.summary}</p>
          <div className="detail-meta"><span><small>Duración estimada</small>{treatment.duration}</span><span><small>Valor</small>{treatment.price}</span></div>
          <div className="detail-actions"><Link className="primary" href={`/?agendar=${treatment.slug}`}>Agendar evaluación <span>↗</span></Link><a className="detail-whatsapp" href={`https://wa.me/56979655129?text=${whatsappText}`} target="_blank" rel="noreferrer">Consultar por WhatsApp</a></div>
        </div>
        <figure><img src={treatment.image} alt={`${treatment.eyebrow} en Bellabel Rancagua`} /></figure>
      </section>

      <section className="treatment-information">
        <article><span>01</span><h2>Puede ser para ti si buscas</h2><ul>{treatment.suitableFor.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><span>02</span><h2>Tu experiencia incluye</h2><ul>{treatment.includes.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><span>03</span><h2>Antes de agendar</h2><ul>{treatment.considerations.map((item) => <li key={item}>{item}</li>)}</ul></article>
      </section>

      <section className="treatment-disclaimer"><p>Información educativa y referencial</p><h2>La indicación correcta comienza con una evaluación.</h2><span>Los resultados, número de sesiones, recuperación y posibles contraindicaciones dependen de los antecedentes y características de cada persona.</span><Link className="cream-button" href={`/?agendar=${treatment.slug}`}>Encontrar una hora <b>→</b></Link></section>
    </main>
  );
}
