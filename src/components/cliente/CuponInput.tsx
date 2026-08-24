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
      <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
        <span className="text-green-800">
          Cupón <strong>{aplicado.codigo}</strong> · −{formatCurrency(aplicado.descuento)}
        </span>
        <button onClick={onQuitar} className="text-xs text-green-700 underline">
          quitar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Código de cupón"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm uppercase"
        />
        <button
          onClick={probar}
          disabled={estado === "validando" || !codigo.trim()}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          {estado === "validando" ? "…" : "Aplicar"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
