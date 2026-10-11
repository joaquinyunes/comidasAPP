import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Etiqueta from "../ui/Etiqueta";
import Bloque from "../ui/Bloque";
import type { Alerta } from "./armar-alertas";

const BARRA: Record<Alerta["tono"], string> = {
  peligro: "bg-pn-peligro",
  aviso: "bg-pn-aviso",
  info: "bg-pn-info",
  ok: "bg-pn-ok",
  neutro: "bg-pn-linea-fuerte",
};

// "Qué mirar ahora": solo lo que pide atención, con el paso siguiente.
export default function ListaAlertas({ alertas }: { alertas: Alerta[] }) {
  return (
    <Bloque titulo="Qué mirar ahora" sinPadding>
      {alertas.length === 0 ? (
        <p className="px-4 py-6 text-sm text-pn-suave">
          Nada urgente. Las mesas están atendidas, el stock está por encima del mínimo y la cocina va en tiempo.
        </p>
      ) : (
        <ul className="divide-y divide-pn-linea">
          {alertas.map((a) => (
            <li key={a.id} className="relative flex items-center gap-3 px-4 py-3">
              <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", BARRA[a.tono])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-pn-tinta">{a.titulo}</p>
                <p className="mt-0.5 text-xs text-pn-suave">{a.detalle}</p>
              </div>
              <Etiqueta tono={a.tono} className="hidden sm:inline-flex">
                {a.tono === "peligro" ? "Urgente" : "Revisar"}
              </Etiqueta>
              <Link
                href={a.href}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-pn-linea-fuerte px-3 text-sm font-medium hover:bg-pn-hundido"
              >
                {a.accion}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Bloque>
  );
}
