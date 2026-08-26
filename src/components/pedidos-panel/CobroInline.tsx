"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { montoPropina, totalConPropina } from "@/lib/pedidos/precio";
import { cobrarPedido } from "./accionesPedido";

const METODOS = [
  { valor: "efectivo", label: "Efectivo" },
  { valor: "tarjeta", label: "Tarjeta" },
  { valor: "qr", label: "QR" },
  { valor: "transferencia", label: "Transfer." },
];
const PROPINAS = [0, 5, 10];

interface Props {
  pedidoId: string;
  total: number;
  onCobrado: () => void;
}

export default function CobroInline({ pedidoId, total, onCobrado }: Props) {
  const [metodo, setMetodo] = useState("efectivo");
  const [propinaPct, setPropinaPct] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propina = montoPropina(total, propinaPct);
  const aPagar = totalConPropina(total, propina);

  async function confirmar() {
    setOcupado(true);
    setError(null);
    const r = await cobrarPedido(pedidoId, aPagar, metodo, propina);
    setOcupado(false);
    if (r.ok) onCobrado();
    else setError(r.mensaje ?? "Error");
  }

  return (
    <div className="mt-2 rounded-xl bg-zinc-50 p-3">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {METODOS.map((m) => (
          <button
            key={m.valor}
            onClick={() => setMetodo(m.valor)}
            className={`rounded-md px-2 py-1 text-xs ${
              metodo === m.valor ? "bg-zinc-900 text-white" : "bg-white border border-zinc-300"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="mb-2 flex gap-1.5">
        {PROPINAS.map((p) => (
          <button
            key={p}
            onClick={() => setPropinaPct(p)}
            className={`rounded-md px-2 py-1 text-xs ${
              propinaPct === p ? "bg-zinc-900 text-white" : "bg-white border border-zinc-300"
            }`}
          >
            {p === 0 ? "Sin prop." : `${p}%`}
          </button>
        ))}
      </div>
      {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
      <button
        onClick={confirmar}
        disabled={ocupado}
        className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {ocupado ? "Cobrando…" : `Cobrar ${formatCurrency(aPagar)}`}
      </button>
    </div>
  );
}
