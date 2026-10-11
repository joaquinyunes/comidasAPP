"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { montoPropina, totalConPropina } from "@/lib/pedidos/precio";
import Boton from "@/components/panel/ui/Boton";
import AvisoError from "@/components/panel/ui/AvisoError";
import GrupoOpciones from "@/components/panel/cobro/GrupoOpciones";
import CampoVuelto from "@/components/panel/cobro/CampoVuelto";
import { METODOS_COBRO, PROPINAS_COBRO } from "@/components/panel/cobro/opciones-cobro";
import { cobrarPedido } from "./accionesPedido";

interface Props {
  pedidoId: string;
  total: number;
  onCobrado: () => void;
}

// Cobro de un pedido suelto (caja / lista de pedidos).
export default function CobroInline({ pedidoId, total, onCobrado }: Props) {
  const [metodo, setMetodo] = useState("efectivo");
  const [propinaPct, setPropinaPct] = useState("0");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propina = montoPropina(total, Number(propinaPct));
  const aPagar = totalConPropina(total, propina);

  async function confirmar() {
    setOcupado(true);
    setError(null);
    const r = await cobrarPedido(pedidoId, aPagar, metodo, propina);
    setOcupado(false);
    if (r.ok) onCobrado();
    else setError(r.mensaje ?? "No se pudo cobrar.");
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-pn-linea bg-pn-fondo p-3">
      <GrupoOpciones leyenda="Cómo paga" opciones={METODOS_COBRO} valor={metodo} onCambio={setMetodo} />
      <GrupoOpciones leyenda="Propina" opciones={PROPINAS_COBRO} valor={propinaPct} onCambio={setPropinaPct} columnas={3} />
      {metodo === "efectivo" && <CampoVuelto total={aPagar} />}
      {error && <AvisoError>{error}</AvisoError>}
      <Boton variante="primario" tamano="grande" className="w-full" disabled={ocupado} onClick={confirmar}>
        {ocupado ? "Cobrando…" : `Cobrar ${formatCurrency(aPagar)}`}
      </Boton>
    </div>
  );
}
