import type { ReactNode } from "react";

interface Props {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}

// Cabecera de cada pantalla: qué es, para qué sirve y sus acciones.
export default function EncabezadoPagina({ titulo, descripcion, acciones }: Props) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-pn-tinta sm:text-2xl">{titulo}</h1>
        {descripcion && <p className="mt-0.5 max-w-prose text-sm text-pn-suave">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </header>
  );
}
