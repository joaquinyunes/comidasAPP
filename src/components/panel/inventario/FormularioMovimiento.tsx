"use client";

import { useId, useState } from "react";
import Hoja from "../ui/Hoja";
import Boton from "../ui/Boton";
import AvisoError from "../ui/AvisoError";
import GrupoOpciones from "../cobro/GrupoOpciones";
import { ACCIONES_STOCK, armarMovimiento, type AccionStock } from "@/lib/inventario/movimiento";
import { registrarMovimiento } from "./acciones-inventario";
import type { IngredienteStock } from "./tipos";

interface Props {
  item: IngredienteStock;
  onCerrar: () => void;
  onListo: () => void;
}

// Registrar qué pasó con un ingrediente, con las palabras del encargado.
export default function FormularioMovimiento({ item, onCerrar, onListo }: Props) {
  const idCantidad = useId();
  const idMotivo = useId();
  const [accion, setAccion] = useState<AccionStock>("llego");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unidad = item.ingrediente.unidadMedida;
  const numero = Number(cantidad.replace(",", "."));
  const movimiento = cantidad.trim() === "" ? null : armarMovimiento(accion, numero, item.cantidadActual);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!movimiento) return;
    setEnviando(true);
    setError(null);
    const r = await registrarMovimiento({
      sucursalId: item.sucursalId,
      ingredienteId: item.ingredienteId,
      lote: item.lote,
      tipo: movimiento.tipo,
      cantidad: movimiento.cantidad,
      motivo: motivo.trim() || undefined,
    });
    setEnviando(false);
    if (r.ok) onListo();
    else setError(r.mensaje ?? "No se pudo registrar.");
  }

  const etiquetaCantidad = accion === "conteo" ? `Cantidad que hay ahora (${unidad})` : `Cantidad (${unidad})`;

  return (
    <Hoja titulo={item.ingrediente.nombre} subtitulo={`Hay ${item.cantidadActual} ${unidad}`} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="space-y-4">
        <GrupoOpciones
          leyenda="¿Qué pasó?"
          opciones={ACCIONES_STOCK.map((a) => ({ valor: a.valor, etiqueta: a.etiqueta }))}
          valor={accion}
          onCambio={(v) => setAccion(v as AccionStock)}
        />

        <div>
          <label htmlFor={idCantidad} className="mb-1.5 block text-sm font-medium">
            {etiquetaCantidad}
          </label>
          <input
            id={idCantidad}
            inputMode="decimal"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            autoFocus
            className="pn-num min-h-12 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-lg"
          />
          {accion === "conteo" && movimiento && (
            <p className="pn-num mt-1.5 text-sm text-pn-suave">
              Se corrige en {movimiento.cantidad > 0 ? "+" : ""}
              {movimiento.cantidad} {unidad}.
            </p>
          )}
        </div>

        <div>
          <label htmlFor={idMotivo} className="mb-1.5 block text-sm font-medium">
            Motivo <span className="font-normal text-pn-suave">(opcional)</span>
          </label>
          <input
            id={idMotivo}
            value={motivo}
            maxLength={200}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej.: factura 0021, se cayó la bandeja"
            className="min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base"
          />
        </div>

        {error && <AvisoError>{error}</AvisoError>}

        <Boton type="submit" variante="primario" tamano="grande" className="w-full" disabled={!movimiento || enviando}>
          {enviando ? "Guardando…" : "Guardar movimiento"}
        </Boton>
      </form>
    </Hoja>
  );
}
