"use client";

import { Plus, Receipt, Sparkles, UserRound } from "lucide-react";
import { pideCuenta } from "@/lib/salon/resumir-salon";
import Boton from "../ui/Boton";
import type { MesaSalon } from "./tipos";

interface Props {
  mesa: MesaSalon;
  cobrando: boolean;
  ocupado: boolean;
  onTomarPedido: () => void;
  onAlternarCobro: () => void;
  onCambiarEstado: (estado: string) => void;
}

// Las acciones cambian según lo que la mesa necesita ahora.
export default function AccionesMesa({
  mesa,
  cobrando,
  ocupado,
  onTomarPedido,
  onAlternarCobro,
  onCambiarEstado,
}: Props) {
  const conPedidos = mesa.pedidos.length > 0;

  if (mesa.estado === "limpieza") {
    return (
      <Boton variante="primario" tamano="grande" className="w-full" disabled={ocupado} onClick={() => onCambiarEstado("libre")}>
        <Sparkles className="size-5" aria-hidden />
        Mesa lista para sentar
      </Boton>
    );
  }

  return (
    <div className="space-y-2">
      <Boton
        variante={conPedidos ? "secundario" : "primario"}
        tamano="grande"
        className="w-full"
        onClick={onTomarPedido}
      >
        <Plus className="size-5" aria-hidden />
        {conPedidos ? "Agregar al pedido" : "Tomar pedido"}
      </Boton>

      {conPedidos && (
        <Boton
          variante={pideCuenta(mesa.estado) || cobrando ? "primario" : "secundario"}
          tamano="grande"
          className="w-full"
          onClick={onAlternarCobro}
        >
          <Receipt className="size-5" aria-hidden />
          {cobrando ? "Ocultar cobro" : "Cobrar la mesa"}
        </Boton>
      )}

      {conPedidos && !pideCuenta(mesa.estado) && (
        <Boton
          variante="texto"
          className="w-full"
          disabled={ocupado}
          onClick={() => onCambiarEstado("esperando_cuenta")}
        >
          El cliente pidió la cuenta
        </Boton>
      )}

      {!conPedidos && mesa.estado !== "libre" && (
        <Boton variante="texto" className="w-full" disabled={ocupado} onClick={() => onCambiarEstado("libre")}>
          <UserRound className="size-4" aria-hidden />
          Se fueron: liberar mesa
        </Boton>
      )}
    </div>
  );
}
