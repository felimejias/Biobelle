import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export function BrandSocial() {
  return (
    <div className="brand-zone">
      <Link className="brand" href="/" aria-label="Bellabel inicio">
        <span className="brand-lockup"><img src="/images/bellabel-lockup.png" alt="Bellabel Centro Médico Estético" /></span>
      </Link>
      <span className="brand-divider" aria-hidden="true" />
      <nav className="brand-socials" aria-label="Redes sociales Bellabel">
        <a className="brand-social instagram-link" href="https://www.instagram.com/bellabel_center?igsi=aXhkd283dXQ2M2Ex" target="_blank" rel="noreferrer" aria-label="Instagram de Bellabel">
          <FaInstagram aria-hidden="true" /><span>@bellabel_center</span>
        </a>
        <a className="brand-social whatsapp-link" href={`https://wa.me/56944986391?text=${encodeURIComponent("Hola Bellabel, quisiera recibir orientación sobre sus tratamientos.")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp de Bellabel">
          <FaWhatsapp aria-hidden="true" /><span>+56 9 4498 6391</span>
        </a>
      </nav>
    </div>
  );
}
