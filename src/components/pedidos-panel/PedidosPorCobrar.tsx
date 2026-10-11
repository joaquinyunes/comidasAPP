"use client";

import { useMemo } from "react";
import { pedidosDeGrupo } from "@/lib/pedidos/grupos-lista";
import Bloque from "@/components/panel/ui/Bloque";
import EstadoVacio from "@/components/panel/ui/EstadoVacio";
import AvisoError from "@/components/panel/ui/AvisoError";
import { useListaPedidos } from "./useListaPedidos";
import PedidoFila from "./PedidoFila";

// Vista de caja: solo lo que falta cobrar.
export default function PedidosPorCobrar() {
  const { pedidos, cargando, error, recargar } = useListaPedidos();
  const porCobrar = useMemo(() => pedidosDeGrupo(pedidos, "abiertos"), [pedidos]);

  return (
    <Bloque titulo="Por cobrar" nota={`${porCobrar.length} ${porCobrar.length === 1 ? "pedido" : "pedidos"}`}>
      {error && <AvisoError onReintentar={recargar}>{error}</AvisoError>}
      {cargando && pedidos.length === 0 && <p className="text-sm text-pn-suave">Cargando…</p>}
      {!cargando && !error && porCobrar.length === 0 && (
        <EstadoVacio titulo="Nada pendiente de cobro" detalle="Las mesas cobradas ya figuran en el resumen de arriba." />
      )}
      <ul className="space-y-2">
        {porCobrar.map((p) => (
          <PedidoFila key={p.id} pedido={p} onCambio={recargar} />
        ))}
      </ul>
    </Bloque>
  );
}
