import type { Metadata } from "next";
import NosotrosPagina from "@/components/nosotros/NosotrosPagina";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "La historia de Cozizina: del food truck en Palermo a dos locales y reparto propio en Buenos Aires. Mismo sabor, misma cocina.",
};

export default function NosotrosPage() {
  return <NosotrosPagina />;
}
