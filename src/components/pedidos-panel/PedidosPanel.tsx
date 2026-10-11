"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { GRUPOS_PEDIDOS, pedidosDeGrupo } from "@/lib/pedidos/grupos-lista";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";
import EstadoVacio from "@/components/panel/ui/EstadoVacio";
import AvisoError from "@/components/panel/ui/AvisoError";
import Boton from "@/components/panel/ui/Boton";
import Filtros from "@/components/panel/ui/Filtros";
import { useListaPedidos } from "./useListaPedidos";
import PedidoFila from "./PedidoFila";

export default function PedidosPanel() {
  const { pedidos, cargando, error, recargar } = useListaPedidos();
  const [grupo, setGrupo] = useState<string>("abiertos");

  const visibles = useMemo(() => pedidosDeGrupo(pedidos, grupo), [pedidos, grupo]);

  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina
        titulo="Pedidos"
        descripcion="Todo lo que entró hoy, con su estado. Tocá un pedido para ver el detalle o cobrarlo."
        acciones={
          <Boton onClick={recargar} aria-label="Actualizar pedidos">
            <RefreshCw className="size-4" aria-hidden />
            <span className="hidden sm:inline">Actualizar</span>
          </Boton>
        }
      />

      <div className="mb-4">
        <Filtros
          aria-label="Estado de los pedidos"
          valor={grupo}
          onCambio={setGrupo}
          opciones={GRUPOS_PEDIDOS.map((g) => ({
            valor: g.clave,
            etiqueta: g.etiqueta,
            cantidad: pedidosDeGrupo(pedidos, g.clave).length,
          }))}
        />
      </div>

      {error && (
        <div className="mb-4">
          <AvisoError onReintentar={recargar}>{error}</AvisoError>
        </div>
      )}
      {cargando && pedidos.length === 0 && <p className="text-sm text-pn-suave">Cargando pedidos…</p>}
      {!cargando && !error && visibles.length === 0 && (
        <EstadoVacio titulo="No hay pedidos en esta lista" detalle="Cuando entren, aparecen solos." />
      )}

      <ul className="space-y-2">
        {visibles.map((p) => (
          <PedidoFila key={p.id} pedido={p} onCambio={recargar} />
        ))}
      </ul>
    </div>
  );
}
