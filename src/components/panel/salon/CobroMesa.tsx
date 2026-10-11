"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { montoPropina, totalConPropina } from "@/lib/pedidos/precio";
import Boton from "../ui/Boton";
import AvisoError from "../ui/AvisoError";
import GrupoOpciones from "../cobro/GrupoOpciones";
import CampoVuelto from "../cobro/CampoVuelto";
import { METODOS_COBRO, PROPINAS_COBRO } from "../cobro/opciones-cobro";
import { cobrarMesa } from "./acciones-salon";
import type { PedidoSalon } from "./tipos";

interface Props {
  pedidos: PedidoSalon[];
  onCobrado: () => void;
}

// Cobro de toda la mesa: método, propina y un único botón con el total.
export default function CobroMesa({ pedidos, onCobrado }: Props) {
  const [metodo, setMetodo] = useState("efectivo");
  const [propinaPct, setPropinaPct] = useState("0");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pct = Number(propinaPct);
  const subtotal = pedidos.reduce((s, p) => s + p.total, 0);
  const propina = pedidos.reduce((s, p) => s + montoPropina(p.total, pct), 0);
  const total = pedidos.reduce((s, p) => s + totalConPropina(p.total, montoPropina(p.total, pct)), 0);

  async function confirmar() {
    setOcupado(true);
    setError(null);
    const r = await cobrarMesa(pedidos, metodo, pct);
    setOcupado(false);
    if (r.ok) {
      onCobrado();
      return;
    }
    setError(r.mensaje ?? "No se pudo cobrar.");
    if (r.cobrados > 0) onCobrado();
  }

  return (
    <section className="space-y-3 rounded-lg border border-pn-linea bg-pn-papel p-3">
      <GrupoOpciones leyenda="Cómo paga" opciones={METODOS_COBRO} valor={metodo} onCambio={setMetodo} />
      <GrupoOpciones
        leyenda="Propina"
        opciones={PROPINAS_COBRO}
        valor={propinaPct}
        onCambio={setPropinaPct}
        columnas={3}
      />
      {metodo === "efectivo" && <CampoVuelto total={total} />}

      <dl className="pn-num space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-pn-suave">Consumo</dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>
        {propina > 0 && (
          <div className="flex justify-between">
            <dt className="text-pn-suave">Propina</dt>
            <dd>{formatCurrency(propina)}</dd>
          </div>
        )}
      </dl>

      {error && <AvisoError>{error}</AvisoError>}

      <Boton variante="primario" tamano="grande" className="w-full" disabled={ocupado} onClick={confirmar}>
        {ocupado ? "Cobrando…" : `Cobrar ${formatCurrency(total)}`}
      </Boton>
    </section>
  );
}
