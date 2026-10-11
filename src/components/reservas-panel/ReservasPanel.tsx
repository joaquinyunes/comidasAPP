"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ESTADOS_RESERVA, ETIQUETA_ESTADO } from "@/lib/reservas/estados";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";
import EstadoVacio from "@/components/panel/ui/EstadoVacio";
import AvisoError from "@/components/panel/ui/AvisoError";
import Boton from "@/components/panel/ui/Boton";
import Filtros from "@/components/panel/ui/Filtros";
import { useReservas } from "./useReservas";
import ReservaFila from "./ReservaFila";

const hoyISO = () => new Date().toISOString().slice(0, 10);

export default function ReservasPanel() {
  const [fecha, setFecha] = useState(hoyISO());
  const [estado, setEstado] = useState("");
  const { reservas, cargando, error, recargar } = useReservas({ fecha });

  const conteo = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of reservas) c[r.estado] = (c[r.estado] ?? 0) + 1;
    return c;
  }, [reservas]);

  const visibles = estado ? reservas.filter((r) => r.estado === estado) : reservas;
  const personas = reservas
    .filter((r) => ["pendiente", "confirmada", "sentada"].includes(r.estado))
    .reduce((s, r) => s + r.cantidadPersonas, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina
        titulo="Reservas"
        descripcion={
          reservas.length === 0
            ? "Confirmá, sentá o cancelá las reservas del día."
            : `${personas} personas esperadas ese día.`
        }
        acciones={
          <>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              aria-label="Fecha"
              className="min-h-9 rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-sm"
            />
            <Boton onClick={() => setFecha(hoyISO())}>Hoy</Boton>
            <Boton onClick={recargar} aria-label="Actualizar reservas">
              <RefreshCw className="size-4" aria-hidden />
            </Boton>
          </>
        }
      />

      <div className="mb-4">
        <Filtros
          aria-label="Estado de la reserva"
          valor={estado}
          onCambio={setEstado}
          opciones={[
            { valor: "", etiqueta: "Todas", cantidad: reservas.length },
            ...ESTADOS_RESERVA.map((e) => ({ valor: e, etiqueta: ETIQUETA_ESTADO[e], cantidad: conteo[e] ?? 0 })),
          ]}
        />
      </div>

      {error && (
        <div className="mb-4">
          <AvisoError onReintentar={recargar}>{error}</AvisoError>
        </div>
      )}
      {cargando && reservas.length === 0 && <p className="text-sm text-pn-suave">Cargando reservas…</p>}
      {!cargando && !error && visibles.length === 0 && (
        <EstadoVacio titulo="No hay reservas para mostrar" detalle="Probá con otra fecha o quitá el filtro." />
      )}

      <ul className="space-y-2">
        {visibles.map((r) => (
          <ReservaFila key={r.id} reserva={r} onCambio={recargar} />
        ))}
      </ul>
    </div>
  );
}
