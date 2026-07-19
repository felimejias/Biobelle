import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export function BrandSocial() {
  return (
    <div className="brand-zone">
      <Link className="brand" href="/" aria-label="BIOBELLE inicio">
        <span className="brand-lockup"><img src="/images/biobelle-lockup.png" alt="BIOBELLE Centro Médico Estético" /></span>
      </Link>
      <span className="brand-divider" aria-hidden="true" />
      <nav className="brand-socials" aria-label="Redes sociales BIOBELLE">
        <a className="brand-social instagram-link" href="https://instagram.com/biobelle_center" target="_blank" rel="noreferrer" aria-label="Instagram de BIOBELLE">
          <FaInstagram aria-hidden="true" /><span>@biobelle_center</span>
        </a>
        <a className="brand-social whatsapp-link" href={`https://wa.me/56979655129?text=${encodeURIComponent("Hola BIOBELLE, quisiera recibir orientación sobre sus tratamientos.")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp de BIOBELLE">
          <FaWhatsapp aria-hidden="true" /><span>+56 9 7965 5129</span>
        </a>
      </nav>
    </div>
  );
}
