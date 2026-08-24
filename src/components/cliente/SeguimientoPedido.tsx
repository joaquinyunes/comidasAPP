"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import PagoMesa, { type ResultadoPago } from "./PagoMesa";
import type { EstadoPedido } from "./useEstadoPedido";

interface Props {
  pedidoId: string;
  estado: EstadoPedido | null;
  onNuevoPedido: () => void;
}

export default function SeguimientoPedido({ pedidoId, estado, onNuevoPedido }: Props) {
  const [ultimoPago, setUltimoPago] = useState<ResultadoPago | null>(null);

  const progreso = estado?.progreso ?? 0;
  const saldo = estado?.saldoPendiente ?? estado?.total ?? 0;
  const pagado = estado?.pagado || (ultimoPago?.pedidoSaldado ?? false);
  const hayPagosPrevios = (estado?.pagos ?? 0) > 0;

  return (
    <div className="mx-auto max-w-md p-6 text-center">
      <h1 className="mb-2 text-2xl font-bold">Tu pedido</h1>
      <p className="mb-3 text-zinc-600">{estado?.mensaje ?? "Consultando…"}</p>

      {!pagado && (
        <>
          <div className="my-4 h-3 w-full overflow-hidden rounded-full bg-zinc-100">
            <div className="h-3 rounded-full bg-green-500 transition-all" style={{ width: `${progreso}%` }} />
          </div>
          <p className="text-sm text-zinc-500">{estado?.sinApurar}</p>
        </>
      )}

      {pagado && (
        <div className="my-4 rounded-2xl bg-green-50 p-5">
          <p className="text-3xl">✅</p>
          <p className="mt-1 font-semibold text-green-800">
            {ultimoPago?.mensaje ?? "Pedido pagado"}
          </p>
          {typeof ultimoPago?.vuelto === "number" && ultimoPago.vuelto > 0 && (
            <p className="text-sm text-green-700">Vuelto: {formatCurrency(ultimoPago.vuelto)}</p>
          )}
        </div>
      )}

      {!pagado && ultimoPago && (
        <p className="mt-3 rounded-lg bg-green-50 p-2 text-sm text-green-800">{ultimoPago.mensaje}</p>
      )}

      {!pagado && hayPagosPrevios && (
        <p className="mt-2 text-sm text-zinc-600">
          Ya se pagaron {formatCurrency(estado?.pagadoConsumo ?? 0)} · falta {formatCurrency(saldo)}
        </p>
      )}

      {!pagado && estado?.puedePagar && saldo > 0 && (
        <PagoMesa
          pedidoId={pedidoId}
          saldo={saldo}
          hayPagosPrevios={hayPagosPrevios}
          onPago={(r) => setUltimoPago(r)}
        />
      )}

      <button
        onClick={onNuevoPedido}
        className="mt-5 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white"
      >
        Hacer otro pedido
      </button>
    </div>
  );
}
