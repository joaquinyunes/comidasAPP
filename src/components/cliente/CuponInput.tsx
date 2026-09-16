"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { validarCupon } from "./enviarPedido";

interface Props {
  mesaId?: string;
  tenant?: string;
  subtotal: number;
  aplicado: { codigo: string; descuento: number } | null;
  onAplicar: (codigo: string, descuento: number) => void;
  onQuitar: () => void;
}

export default function CuponInput({ mesaId, tenant, subtotal, aplicado, onAplicar, onQuitar }: Props) {
  const [codigo, setCodigo] = useState("");
  const [estado, setEstado] = useState<"idle" | "validando">("idle");
  const [error, setError] = useState<string | null>(null);

  async function probar() {
    if (!codigo.trim()) return;
    setEstado("validando");
    setError(null);
    const r = await validarCupon({ mesaId, tenant }, codigo.trim(), subtotal);
    setEstado("idle");
    if (r.valido && r.codigo && typeof r.descuento === "number") {
      onAplicar(r.codigo, r.descuento);
      setCodigo("");
    } else {
      setError(r.motivo ?? "Cupón inválido.");
    }
  }

  if (aplicado) {
    return (
      <div className="flex items-center justify-between rounded-2xl border-2 border-black bg-green-50 px-4 py-3 text-sm">
        <span className="text-green-800">
          Cupón <strong>{aplicado.codigo}</strong> · −{formatCurrency(aplicado.descuento)}
        </span>
        <button onClick={onQuitar} className="text-xs font-semibold text-green-700 underline">
          quitar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-4">
      <div className="flex gap-2">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Código de cupón"
          aria-label="Código de cupón"
          className="min-w-0 flex-1 rounded-xl border-2 border-black px-3 py-2 text-sm uppercase"
        />
        <button
          onClick={probar}
          disabled={estado === "validando" || !codigo.trim()}
          className="shrink-0 rounded-xl border-2 border-black px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          {estado === "validando" ? "…" : "Aplicar"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-600" role="alert">{error}</p>}
    </div>
  );
}
