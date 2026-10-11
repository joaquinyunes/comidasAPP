"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import { formatCurrency } from "@/lib/utils";
import {
  agregarAlCarrito,
  cambiarCantidad,
  fijarNota,
  totalCarrito,
  unidadesCarrito,
  type Carrito,
} from "@/lib/salon/carrito";
import Hoja from "../ui/Hoja";
import Boton from "../ui/Boton";
import AvisoError from "../ui/AvisoError";
import SelectorCarta from "./SelectorCarta";
import ResumenCarrito from "./ResumenCarrito";
import { enviarPedido } from "./acciones-salon";
import type { CategoriaCarta } from "./tipos";

interface Props {
  mesaId: string;
  numeroMesa: string;
  onCerrar: () => void;
  onEnviado: () => void;
}

// Toma de pedido en la mesa: elegir, ajustar, mandar a cocina.
export default function TomarPedido({ mesaId, numeroMesa, onCerrar, onEnviado }: Props) {
  const { datos: carta, cargando, error, recargar } = useDatos<CategoriaCarta[]>("/api/salon/carta", 0);
  const [carrito, setCarrito] = useState<Carrito>([]);
  const [enviando, setEnviando] = useState(false);
  const [falla, setFalla] = useState<string | null>(null);

  const unidades = unidadesCarrito(carrito);

  async function enviar() {
    setEnviando(true);
    setFalla(null);
    const r = await enviarPedido(mesaId, carrito);
    setEnviando(false);
    if (r.ok) onEnviado();
    else setFalla(r.mensaje ?? "No se pudo enviar el pedido.");
  }

  const pie = (
    <div>
      {falla && (
        <div className="mb-2">
          <AvisoError>{falla}</AvisoError>
        </div>
      )}
      <Boton
        variante="primario"
        tamano="grande"
        className="w-full"
        disabled={unidades === 0 || enviando}
        onClick={enviar}
      >
        {enviando
          ? "Enviando…"
          : unidades === 0
            ? "Elegí al menos un plato"
            : `Mandar a cocina · ${unidades} · ${formatCurrency(totalCarrito(carrito))}`}
      </Boton>
    </div>
  );

  return (
    <Hoja titulo={`Pedido · Mesa ${numeroMesa}`} subtitulo="Elegí y mandá a cocina" ancho="amplio" onCerrar={onCerrar} pie={pie}>
      {cargando && <p className="text-sm text-pn-suave">Cargando la carta…</p>}
      {error && !carta && <AvisoError onReintentar={recargar}>{error}</AvisoError>}

      {carta && (
        <>
          <SelectorCarta
            carta={carta}
            carrito={carrito}
            onSumar={(i) => setCarrito((c) => agregarAlCarrito(c, i))}
            onRestar={(i) => setCarrito((c) => cambiarCantidad(c, i.id, -1))}
          />
          <ResumenCarrito carrito={carrito} onNota={(id, n) => setCarrito((c) => fijarNota(c, id, n))} />
        </>
      )}
    </Hoja>
  );
}
