import { cn, formatCurrency } from "@/lib/utils";
import { diasParaVencer, porcentajeLleno } from "@/lib/inventario/resumir-stock";
import Etiqueta from "../ui/Etiqueta";
import Boton from "../ui/Boton";
import type { Tono } from "../tonos";
import type { EstadoStock, IngredienteStock } from "./tipos";

const ESTADO: Record<EstadoStock, { texto: string; tono: Tono; barra: string }> = {
  ok: { texto: "Bien", tono: "ok", barra: "bg-pn-ok" },
  bajo: { texto: "Bajo", tono: "aviso", barra: "bg-pn-aviso" },
  critico: { texto: "Se acaba", tono: "peligro", barra: "bg-pn-peligro" },
};

function textoVencimiento(dias: number | null): { texto: string; tono: Tono } | null {
  if (dias === null) return null;
  if (dias < 0) return { texto: `Venció hace ${-dias} d`, tono: "peligro" };
  if (dias <= 3) return { texto: dias === 0 ? "Vence hoy" : `Vence en ${dias} d`, tono: "aviso" };
  return null;
}

interface Props {
  item: IngredienteStock;
  onMover: () => void;
}

export default function FilaIngrediente({ item, onMover }: Props) {
  const e = ESTADO[item.estado];
  const pct = porcentajeLleno(item.cantidadActual, item.cantidadMinima, item.cantidadMaxima);
  const venc = textoVencimiento(diasParaVencer(item.fechaVencimiento));
  const unidad = item.ingrediente.unidadMedida;

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1 basis-44">
        <p className="font-medium">{item.ingrediente.nombre}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-pn-suave">
          <Etiqueta tono={e.tono}>{e.texto}</Etiqueta>
          {venc && <Etiqueta tono={venc.tono}>{venc.texto}</Etiqueta>}
          {item.cantidadMinima > 0 && (
            <span className="pn-num">
              Mínimo {item.cantidadMinima} {unidad}
            </span>
          )}
        </p>
      </div>

      <div className="w-28">
        <div className="h-1.5 rounded-full bg-pn-hundido" aria-hidden>
          <div className={cn("h-full rounded-full", e.barra)} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="w-28 text-right">
        <p className="pn-num text-lg font-semibold leading-none">
          {item.cantidadActual} <span className="text-sm font-normal text-pn-suave">{unidad}</span>
        </p>
        <p className="pn-num mt-1 text-xs text-pn-suave">{formatCurrency(item.valorTotal)}</p>
      </div>

      <Boton onClick={onMover} aria-label={`Registrar movimiento de ${item.ingrediente.nombre}`}>
        Registrar
      </Boton>
    </li>
  );
}
