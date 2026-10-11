import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  titulo?: string;
  nota?: string;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
  sinPadding?: boolean;
}

// Contenedor de una sección. Borde fino, sin sombra.
export default function Bloque({ titulo, nota, acciones, children, className, sinPadding }: Props) {
  return (
    <section className={cn("rounded-lg border border-pn-linea bg-pn-papel", className)}>
      {(titulo || acciones) && (
        <div className="flex items-center justify-between gap-3 border-b border-pn-linea px-4 py-3">
          <div className="min-w-0">
            {titulo && <h2 className="text-sm font-semibold text-pn-tinta">{titulo}</h2>}
            {nota && <p className="text-xs text-pn-suave">{nota}</p>}
          </div>
          {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
        </div>
      )}
      <div className={sinPadding ? "" : "p-4"}>{children}</div>
    </section>
  );
}
