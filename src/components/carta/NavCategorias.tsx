"use client";

import type { CategoriaLanding } from "@/lib/landing-data";
import type { EstiloVars } from "./estilo-vars";
import { temaDeCategoria } from "./tema-categoria";

// Barra de navegación entre sectores: queda pegada arriba, resalta el sector
// que se está viendo (`activa` = id de sección) y muestra el avance del
// scroll como una línea de luz.
export default function NavCategorias({
  categorias,
  activa,
}: {
  categorias: CategoriaLanding[];
  activa: string | null;
}) {
  return (
    <nav className="carta-nav" aria-label="Sectores de la carta">
      {categorias.map((c, i) => {
        const tema = temaDeCategoria(c.nombre, i);
        const id = `cat-${c.id}`;
        const estilo: EstiloVars = { "--c1": tema.color1, "--c2": tema.color2 };
        return (
          <a
            key={c.id}
            href={`#${id}`}
            className="carta-nav-pill"
            style={estilo}
            aria-current={activa === id ? "true" : undefined}
          >
            <span className="carta-nav-punto" aria-hidden="true" />
            {c.nombre}
          </a>
        );
      })}
    </nav>
  );
}
