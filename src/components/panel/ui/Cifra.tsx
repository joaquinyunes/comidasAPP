import { cn } from "@/lib/utils";
import type { Tono } from "../tonos";

interface Props {
  etiqueta: string;
  valor: string;
  detalle?: string;
  tono?: Tono;
}

const COLOR_VALOR: Record<Tono, string> = {
  neutro: "text-pn-tinta",
  ok: "text-pn-ok",
  aviso: "text-pn-aviso",
  peligro: "text-pn-peligro",
  info: "text-pn-info",
};

// Un número que importa, con su etiqueta. Sin iconos ni adornos.
export default function Cifra({ etiqueta, valor, detalle, tono = "neutro" }: Props) {
  return (
    <div className="rounded-lg border border-pn-linea bg-pn-papel px-4 py-3">
      <p className="text-xs font-medium text-pn-suave">{etiqueta}</p>
      <p className={cn("pn-num mt-1 text-2xl font-semibold leading-none", COLOR_VALOR[tono])}>{valor}</p>
      {detalle && <p className="mt-1.5 text-xs text-pn-suave">{detalle}</p>}
    </div>
  );
}
