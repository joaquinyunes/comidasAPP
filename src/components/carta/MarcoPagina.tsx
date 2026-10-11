"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

// Marco compartido por la carta y Nosotros: la paleta crema del home con
// navbar y footer. La "galaxia" vive sólo en secciones puntuales, no acá.
// `portadaOscura`: la portada es una sección espacial y los links del navbar
// (mientras está transparente) tienen que ir en blanco.
export default function MarcoPagina({
  children,
  portadaOscura = false,
}: {
  children: ReactNode;
  portadaOscura?: boolean;
}) {
  return (
    <div className={portadaOscura ? "carta carta-portada-oscura" : "carta"}>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
