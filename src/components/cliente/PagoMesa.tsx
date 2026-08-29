"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { montoPropina, totalConPropina, vueltoEfectivo, efectivoSuficiente } from "@/lib/pedidos/precio";
import { pagarPedido, pagarConMercadoPago, type MetodoPago } from "./pagarPedido";

const METODOS: { valor: MetodoPago; label: string }[] = [
  { valor: "efectivo", label: "💵 Efectivo" },
  { valor: "tarjeta", label: "💳 Tarjeta" },
  { valor: "qr", label: "📱 QR" },
  { valor: "transferencia", label: "🏦 Transferencia" },
];
const PROPINAS = [0, 5, 10, 15];

export interface ResultadoPago {
  mensaje: string;
  vuelto?: number;
  pedidoSaldado?: boolean;
}

interface Props {
  pedidoId: string;
  // Saldo del consumo que falta pagar.
  saldo: number;
  hayPagosPrevios: boolean;
  onPago: (r: ResultadoPago) => void;
}

export default function PagoMesa({ pedidoId, saldo, hayPagosPrevios, onPago }: Props) {
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [propinaPct, setPropinaPct] = useState(0);
  const [efectivo, setEfectivo] = useState("");
  const [dividir, setDividir] = useState(false);
  const [parte, setParte] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mpDisponible, setMpDisponible] = useState(false);

  useEffect(() => {
    fetch("/api/publico/config")
      .then((r) => r.json())
      .then((j) => setMpDisponible(!!j?.data?.pagos?.mercadopago))
      .catch(() => {});
  }, []);

  const montoParcial = dividir ? Math.min(Number(parte || 0), saldo) : undefined;
  const base = dividir ? montoParcial ?? 0 : saldo;
  const propina = montoPropina(base, propinaPct);
  const totalPagar = totalConPropina(base, propina);
  const recibido = Number(efectivo || 0);
  const vuelto = metodo === "efectivo" ? vueltoEfectivo(totalPagar, recibido) : 0;
  const efectivoOk = metodo !== "efectivo" || efectivoSuficiente(totalPagar, recibido);
  const parteOk = !dividir || (base > 0 && base <= saldo);

  async function confirmar() {
    setProcesando(true);
    setError(null);
    const r = await pagarPedido({
      pedidoId,
      metodo,
      porcentajePropina: propinaPct,
      montoEfectivo: metodo === "efectivo" ? recibido : undefined,
      montoParcial,
    });
    setProcesando(false);
    if (r.ok) {
      onPago({ mensaje: r.mensaje, vuelto: r.vuelto, pedidoSaldado: r.pedidoSaldado });
      setEfectivo("");
      setParte("");
    } else {
      setError(r.mensaje);
    }
  }

  async function pagarMP() {
    setProcesando(true);
    setError(null);
    const r = await pagarConMercadoPago(pedidoId, propinaPct);
    if (r.ok && r.initPoint) window.location.href = r.initPoint;
    else {
      setProcesando(false);
      setError(r.mensaje ?? "No se pudo iniciar el pago con MercadoPago.");
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-zinc-200 p-5 text-left">
      <h3 className="mb-3 font-semibold">
        {hayPagosPrevios ? "Seguir pagando" : "Pagar la cuenta"}
      </h3>

      <div className="mb-3 flex justify-between text-sm font-semibold">
        <span>{hayPagosPrevios ? "Saldo pendiente" : "Total"}</span>
        <span>{formatCurrency(saldo)}</span>
      </div>

      <label className="mb-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={dividir} onChange={(e) => setDividir(e.target.checked)} />
        Pagar solo una parte
      </label>
      {dividir && (
        <div className="mb-3">
          <input
            type="number"
            inputMode="decimal"
            value={parte}
            onChange={(e) => setParte(e.target.value)}
            placeholder={`Hasta ${saldo}`}
            aria-label="Monto a pagar"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
      )}

      <div className="mb-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Pagás ahora</span>
          <span>{formatCurrency(base)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Propina ({propinaPct}%)</span>
          <span>{formatCurrency(propina)}</span>
        </div>
        <div className="flex justify-between border-t pt-1 font-semibold">
          <span>Total a pagar</span>
          <span>{formatCurrency(totalPagar)}</span>
        </div>
      </div>

      <p className="mb-1 text-xs font-medium text-zinc-500">Propina</p>
      <div className="mb-3 flex gap-2">
        {PROPINAS.map((p) => (
          <button
            key={p}
            onClick={() => setPropinaPct(p)}
            aria-pressed={propinaPct === p}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              propinaPct === p ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300"
            }`}
          >
            {p === 0 ? "Sin propina" : `${p}%`}
          </button>
        ))}
      </div>

      <p className="mb-1 text-xs font-medium text-zinc-500">Método</p>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {METODOS.map((m) => (
          <button
            key={m.valor}
            onClick={() => setMetodo(m.valor)}
            aria-pressed={metodo === m.valor}
            className={`rounded-lg border px-3 py-2 text-sm ${
              metodo === m.valor ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {metodo === "efectivo" && (
        <div className="mb-3">
          <label htmlFor="pago-efectivo" className="mb-1 block text-xs font-medium text-zinc-500">Con cuánto pagás</label>
          <input
            id="pago-efectivo"
            type="number"
            inputMode="decimal"
            value={efectivo}
            onChange={(e) => setEfectivo(e.target.value)}
            placeholder={totalPagar.toFixed(2)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          {efectivo && vuelto > 0 && (
            <p className="mt-1 text-sm text-green-700">Tu vuelto: {formatCurrency(vuelto)}</p>
          )}
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        onClick={confirmar}
        disabled={procesando || !efectivoOk || !parteOk}
        className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-40"
      >
        {procesando ? "Procesando…" : `Pagar ${formatCurrency(totalPagar)}`}
      </button>

      {mpDisponible && !dividir && (
        <button
          onClick={pagarMP}
          disabled={procesando}
          className="mt-2 w-full rounded-xl border border-[#00b1ea] py-3 text-sm font-semibold text-[#00b1ea] disabled:opacity-40"
        >
          Pagar con MercadoPago
        </button>
      )}
    </div>
  );
}
