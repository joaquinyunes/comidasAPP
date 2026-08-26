"use client";

import { formatCurrency } from "@/lib/utils";
import { useCajaResumen } from "./useCajaResumen";

const ETIQUETA_METODO: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  qr: "QR",
  transferencia: "Transferencia",
  tarjeta_credito: "Tarjeta crédito",
  tarjeta_debito: "Tarjeta débito",
  qr_mp: "QR MercadoPago",
};

export default function CajaResumenCard({ fecha }: { fecha?: string }) {
  const { resumen, error } = useCajaResumen(fecha);

  if (error) return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  if (!resumen) return <p className="text-sm text-zinc-500">Cargando caja…</p>;

  return (
    <div className="rounded-2xl border border-zinc-200 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-semibold">Caja del día</h2>
        <span className="text-xs text-zinc-500">{resumen.fecha}</span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3 text-center">
        <Cifra label="Cobrado" valor={formatCurrency(resumen.total)} />
        <Cifra label="Propinas" valor={formatCurrency(resumen.propinas)} />
        <Cifra label="Pagos" valor={String(resumen.cantidad)} />
      </div>

      <ul className="space-y-1 text-sm">
        {Object.entries(resumen.porMetodo).map(([metodo, d]) => (
          <li key={metodo} className="flex justify-between">
            <span className="text-zinc-500">
              {ETIQUETA_METODO[metodo] ?? metodo} ({d.cantidad})
            </span>
            <span>{formatCurrency(d.total)}</span>
          </li>
        ))}
        {Object.keys(resumen.porMetodo).length === 0 && (
          <li className="text-zinc-400">Todavía no hay cobros hoy.</li>
        )}
      </ul>
    </div>
  );
}

function Cifra({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-2">
      <div className="text-lg font-bold tabular-nums">{valor}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
