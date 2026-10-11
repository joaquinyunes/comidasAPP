"use client";

import { useId, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { efectivoSuficiente, vueltoEfectivo } from "@/lib/pedidos/precio";

interface Props {
  total: number;
}

// "Con cuánto paga": calcula el vuelto para no hacer la cuenta de memoria.
export default function CampoVuelto({ total }: Props) {
  const id = useId();
  const [recibido, setRecibido] = useState("");
  const monto = Number(recibido.replace(",", "."));
  const hayMonto = recibido.trim() !== "" && Number.isFinite(monto);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-pn-suave">
        Paga con
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={recibido}
        onChange={(e) => setRecibido(e.target.value)}
        placeholder={formatCurrency(total)}
        className="pn-num min-h-12 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base"
      />
      {hayMonto && (
        <p
          className={`pn-num mt-1.5 text-sm font-medium ${efectivoSuficiente(total, monto) ? "text-pn-ok" : "text-pn-peligro"}`}
        >
          {efectivoSuficiente(total, monto)
            ? `Vuelto: ${formatCurrency(vueltoEfectivo(total, monto))}`
            : `Falta ${formatCurrency(total - monto)}`}
        </p>
      )}
    </div>
  );
}
