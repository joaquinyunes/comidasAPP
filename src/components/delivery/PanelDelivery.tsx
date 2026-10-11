"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import { formatCurrency, formatTime } from "@/lib/utils";
import Boton from "@/components/panel/ui/Boton";
import Etiqueta from "@/components/panel/ui/Etiqueta";
import EstadoVacio from "@/components/panel/ui/EstadoVacio";
import AvisoError from "@/components/panel/ui/AvisoError";
import type { Tono } from "@/components/panel/tonos";

interface Asignacion {
  id: string;
  estado: string;
  empleado: string;
  zona: string;
  cliente: string;
  total: number;
  horaSalida: string | null;
  horaEntrega: string | null;
}

interface Seguimiento {
  asignaciones: Asignacion[];
}

const ETIQUETA: Record<string, { texto: string; tono: Tono }> = {
  asignado: { texto: "Por salir", tono: "aviso" },
  en_camino: { texto: "En camino", tono: "info" },
  entregado: { texto: "Entregado", tono: "ok" },
  fallido: { texto: "No se pudo entregar", tono: "peligro" },
};

// Siguiente paso natural de un reparto.
const ACCIONES: Record<string, { estado: string; texto: string; principal?: boolean }[]> = {
  asignado: [{ estado: "en_camino", texto: "Salió a repartir", principal: true }],
  en_camino: [
    { estado: "entregado", texto: "Entregado", principal: true },
    { estado: "fallido", texto: "No se pudo entregar" },
  ],
};

export default function PanelDelivery() {
  const { datos, cargando, error, recargar } = useDatos<Seguimiento>("/api/delivery/seguimiento", 8000);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [falla, setFalla] = useState<string | null>(null);

  async function avanzar(id: string, estado: string) {
    setOcupado(id);
    setFalla(null);
    try {
      const res = await fetch(`/api/delivery/${id}/estado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      await recargar();
    } catch {
      setFalla("No se pudo actualizar el reparto. Probá de nuevo.");
    } finally {
      setOcupado(null);
    }
  }

  const lista = datos?.asignaciones ?? [];

  if (cargando && !datos) return <p className="text-sm text-pn-suave">Cargando repartos…</p>;
  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (lista.length === 0) {
    return <EstadoVacio titulo="No hay repartos en curso" detalle="Los pedidos de delivery aparecen acá cuando se asignan a un repartidor." />;
  }

  return (
    <div className="space-y-2">
      {falla && <AvisoError>{falla}</AvisoError>}
      <ul className="space-y-2">
        {lista.map((a) => {
          const e = ETIQUETA[a.estado] ?? { texto: a.estado, tono: "neutro" as Tono };
          return (
            <li key={a.id} className="rounded-lg border border-pn-linea bg-pn-papel p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{a.cliente}</p>
                  <p className="text-sm text-pn-suave">
                    {a.zona} · Reparte {a.empleado}
                  </p>
                  <p className="pn-num mt-0.5 text-xs text-pn-suave">
                    {a.horaSalida ? `Salió ${formatTime(a.horaSalida)}` : "Sin salir"}
                    {a.horaEntrega ? ` · Entregó ${formatTime(a.horaEntrega)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <Etiqueta tono={e.tono}>{e.texto}</Etiqueta>
                  <p className="pn-num mt-1 font-semibold">{formatCurrency(a.total)}</p>
                </div>
              </div>

              {(ACCIONES[a.estado] ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-pn-linea pt-3">
                  {ACCIONES[a.estado].map((acc) => (
                    <Boton
                      key={acc.estado}
                      variante={acc.principal ? "primario" : "peligro"}
                      disabled={ocupado === a.id}
                      onClick={() => avanzar(a.id, acc.estado)}
                    >
                      {acc.texto}
                    </Boton>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
