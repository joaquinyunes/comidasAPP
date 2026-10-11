import type { ReactNode } from "react";

interface Props {
  titulo: string;
  detalle?: string;
  accion?: ReactNode;
}

// Cuando no hay nada que mostrar: dice por qué y qué hacer.
export default function EstadoVacio({ titulo, detalle, accion }: Props) {
  return (
    <div className="rounded-lg border border-dashed border-pn-linea-fuerte px-4 py-10 text-center">
      <p className="text-sm font-medium text-pn-tinta">{titulo}</p>
      {detalle && <p className="mx-auto mt-1 max-w-sm text-sm text-pn-suave">{detalle}</p>}
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  );
}
