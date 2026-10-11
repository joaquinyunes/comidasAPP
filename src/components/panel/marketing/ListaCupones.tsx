"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import { formatCurrency } from "@/lib/utils";
import { describirDescuento, estadoCupon, usosRestantes, type EstadoCupon } from "@/lib/marketing/cupon";
import Bloque from "../ui/Bloque";
import Boton from "../ui/Boton";
import Etiqueta from "../ui/Etiqueta";
import Filtros from "../ui/Filtros";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import FormularioCupon from "./FormularioCupon";
import { cambiarEstadoCupon } from "./acciones-marketing";
import type { Tono } from "../tonos";

interface CuponApi {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: string;
  valor: string | number;
  fechaInicio: string;
  fechaFin: string;
  usosMaximos: number;
  usosActuales: number;
  minimoCompra: string | number;
  activo: boolean;
}

const ESTADO: Record<EstadoCupon, { texto: string; tono: Tono }> = {
  vigente: { texto: "Vigente", tono: "ok" },
  pausado: { texto: "Pausado", tono: "neutro" },
  vencido: { texto: "Vencido", tono: "peligro" },
  agotado: { texto: "Agotado", tono: "aviso" },
  proximo: { texto: "Todavía no empezó", tono: "info" },
};

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });
}

export default function ListaCupones() {
  const [vista, setVista] = useState("activos");
  const [creando, setCreando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const { datos, cargando, error, recargar } = useDatos<CuponApi[]>(
    `/api/marketing/cupones?limit=100&activo=${vista === "activos"}`,
    0
  );
  const cupones = datos ?? [];

  async function alternar(c: CuponApi) {
    setOcupado(c.id);
    await cambiarEstadoCupon(c.id, !c.activo);
    setOcupado(null);
    void recargar();
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Filtros
          aria-label="Cupones"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: "activos", etiqueta: "Activos" },
            { valor: "pausados", etiqueta: "Pausados" },
          ]}
        />
        <Boton variante="primario" onClick={() => setCreando(true)}>
          Nuevo cupón
        </Boton>
      </div>

      {error && !datos && <AvisoError onReintentar={recargar}>{error}</AvisoError>}
      {cargando && !datos && <p className="text-sm text-pn-suave">Cargando cupones…</p>}

      {datos && cupones.length === 0 && (
        <EstadoVacio
          titulo={vista === "activos" ? "No hay cupones activos" : "No hay cupones pausados"}
          detalle={vista === "activos" ? "Creá uno para dar un descuento o traer clientes de vuelta." : undefined}
        />
      )}

      {cupones.length > 0 && (
        <Bloque sinPadding>
          <ul className="divide-y divide-pn-linea">
            {cupones.map((c) => {
              const e = ESTADO[estadoCupon({ ...c, valor: Number(c.valor) })];
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-dashed border-pn-linea-fuerte px-2 py-0.5 font-mono text-sm font-semibold">
                        {c.codigo}
                      </span>
                      <Etiqueta tono={e.tono}>{e.texto}</Etiqueta>
                    </p>
                    <p className="mt-1 text-sm">
                      {describirDescuento(c.tipo, Number(c.valor))}
                      {Number(c.minimoCompra) > 0 && (
                        <span className="text-pn-suave"> · desde {formatCurrency(Number(c.minimoCompra))}</span>
                      )}
                    </p>
                    <p className="pn-num text-xs text-pn-suave">
                      {fecha(c.fechaInicio)} al {fecha(c.fechaFin)} · quedan {usosRestantes(c)} de {c.usosMaximos} usos
                    </p>
                  </div>
                  <Boton disabled={ocupado === c.id} onClick={() => alternar(c)}>
                    {c.activo ? "Pausar" : "Reactivar"}
                  </Boton>
                </li>
              );
            })}
          </ul>
        </Bloque>
      )}

      {creando && (
        <FormularioCupon
          onCerrar={() => setCreando(false)}
          onCreado={() => {
            setCreando(false);
            void recargar();
          }}
        />
      )}
    </>
  );
}
