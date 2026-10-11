"use client";

import { formatCurrency } from "@/lib/utils";
import Bloque from "@/components/panel/ui/Bloque";
import Cifra from "@/components/panel/ui/Cifra";
import AvisoError from "@/components/panel/ui/AvisoError";
import { useCajaResumen } from "./useCajaResumen";

const ETIQUETA_METODO: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  qr: "QR",
  transferencia: "Transferencia",
  tarjeta_credito: "Tarjeta de crédito",
  tarjeta_debito: "Tarjeta de débito",
  qr_mp: "QR MercadoPago",
};

// Lo cobrado en el día, por forma de pago: la base del arqueo.
export default function CajaResumenCard({ fecha }: { fecha?: string }) {
  const { resumen, error, recargar } = useCajaResumen(fecha);

  if (error && !resumen) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (!resumen) return <p className="text-sm text-pn-suave">Cargando caja…</p>;

  const metodos = Object.entries(resumen.porMetodo).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Cifra etiqueta="Cobrado hoy" valor={formatCurrency(resumen.total)} />
        <Cifra etiqueta="Propinas" valor={formatCurrency(resumen.propinas)} />
        <Cifra etiqueta="Cobros" valor={String(resumen.cantidad)} />
      </div>

      <Bloque titulo="Por forma de pago" nota="Para el arqueo al cerrar" sinPadding>
        {metodos.length === 0 ? (
          <p className="px-4 py-5 text-sm text-pn-suave">Todavía no hay cobros hoy.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pn-linea text-left text-xs text-pn-suave">
                <th className="px-4 py-2 font-medium">Forma de pago</th>
                <th className="px-2 py-2 text-right font-medium">Cobros</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="pn-num">
              {metodos.map(([metodo, d]) => (
                <tr key={metodo} className="border-b border-pn-linea last:border-b-0">
                  <td className="px-4 py-2.5 font-medium">{ETIQUETA_METODO[metodo] ?? metodo}</td>
                  <td className="px-2 py-2.5 text-right text-pn-suave">{d.cantidad}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(d.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Bloque>
    </div>
  );
}
