"use client";

import Link from "next/link";
import { SITE } from "@/config/site";

export default function Footer() {
  return (
    <footer className="pop-footer" id="contacto">
      <div className="pop-footer-links">
        <Link href="/menu">Carta</Link>
        <Link href="/nosotros">Nosotros</Link>
        <Link href="/ubicaciones">Ubicaciones</Link>
        <Link href="/reservar">Reservar</Link>
        <Link href="/ordenar">Ordenar</Link>
        <a href={`tel:${SITE.contacto.telefono.replace(/\s/g, "")}`}>
          {SITE.contacto.telefono}
        </a>
      </div>
      <div className="pop-footer-wordmark">
        <h2 className="font-display">COZIZINA</h2>
      </div>
      <div className="pop-footer-fine">
        <span>
          {SITE.contacto.direccion} · {SITE.contacto.email}
        </span>
        <br />
        &copy; {new Date().getFullYear()} Cozizina. Todos los derechos reservados. ·{" "}
        <Link href="/terminos">Términos</Link> ·{" "}
        <Link href="/privacidad">Privacidad</Link>
      </div>
    </footer>
  );
}
