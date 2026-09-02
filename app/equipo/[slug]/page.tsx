import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandSocial } from "../../components/BrandSocial";
import { getProfessional, professionals } from "../data";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return professionals.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const professional = getProfessional((await params).slug);
  if (!professional) return {};
  return {
    title: `${professional.name} | Equipo Bellabel`,
    description: `${professional.role} en Bellabel Rancagua. Conoce su enfoque y áreas de atención.`,
  };
}

export default async function ProfessionalPage({ params }: PageProps) {
  const professional = getProfessional((await params).slug);
  if (!professional) notFound();

  return <main className="professional-page">
    <div className="announcement">Equipo Bellabel · Atención profesional y cercana</div>
    <header className="site-header treatment-header"><BrandSocial /><Link className="back-home" href="/#equipo">← Volver al equipo</Link></header>
    <section className="professional-hero">
      <figure><img src={professional.image} alt={professional.name} /></figure>
      <div><p className="kicker">Conoce a la profesional</p><h1>{professional.name}</h1><p className="professional-role">{professional.role}</p><p>{professional.introduction}</p><Link className="primary" href="/?agendar=evaluacion">Agendar evaluación <span>↗</span></Link></div>
    </section>
    <section className="professional-areas">
      <div className="professional-philosophy"><p className="section-number">FORMACIÓN Y COMPETENCIAS</p><h2>Cuidado con ciencia<br /><em>y propósito.</em></h2><blockquote>“{professional.philosophy}”</blockquote></div>
      <div className="professional-area-grid">{professional.areas.map((area, index) => <article key={area.title}><span>0{index + 1}</span><h3>{area.title}</h3><ul>{area.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div>
    </section>
    <section className="profile-disclaimer"><p>La información describe áreas comunicadas por Bellabel. Cada procedimiento requiere evaluación profesional previa; la indicación, contraindicaciones y derivación se determinan individualmente.</p></section>
  </main>;
}
