"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAhora } from "@/hooks/use-ahora";
import { MIN_CRITICA, minutosDesde, ordenarComandas } from "@/lib/cocina/demora";
import { estacionesDe, filtrarPorEstacion, nombreEstacion } from "@/lib/cocina/estaciones";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";
import EstadoVacio from "@/components/panel/ui/EstadoVacio";
import AvisoError from "@/components/panel/ui/AvisoError";
import Boton from "@/components/panel/ui/Boton";
import Filtros from "@/components/panel/ui/Filtros";
import { useTablero } from "./useTablero";
import ComandaCard from "./ComandaCard";

const TODAS = "todas";

// Pantalla de cocina y barra: lo más viejo primero, cada puesto ve lo suyo.
export default function TableroCocina() {
  const { comandas, cargando, error, recargar } = useTablero();
  const ahora = useAhora(30000);
  const [estacion, setEstacion] = useState(TODAS);

  const estaciones = useMemo(() => estacionesDe(comandas), [comandas]);
  const visibles = useMemo(
    () => ordenarComandas(filtrarPorEstacion(comandas, estacion === TODAS ? null : estacion)),
    [comandas, estacion]
  );

  const platosPendientes = visibles.reduce(
    (n, c) => n + c.items.filter((i) => i.estado !== "listo").length,
    0
  );
  const demoradas = visibles.filter((c) => minutosDesde(c.desde, ahora) >= MIN_CRITICA).length;

  return (
    <div className="mx-auto max-w-7xl">
      <EncabezadoPagina
        titulo="Cocina"
        descripcion={
          visibles.length === 0
            ? "Sin comandas por ahora."
            : `${platosPendientes} ${platosPendientes === 1 ? "plato pendiente" : "platos pendientes"} en ${visibles.length} ${visibles.length === 1 ? "comanda" : "comandas"}${demoradas > 0 ? ` · ${demoradas} demorada${demoradas === 1 ? "" : "s"}` : ""}`
        }
        acciones={
          <Boton onClick={recargar} aria-label="Actualizar comandas">
            <RefreshCw className="size-4" aria-hidden />
            <span className="hidden sm:inline">Actualizar</span>
          </Boton>
        }
      />

      {estaciones.length > 1 && (
        <div className="mb-4">
          <Filtros
            aria-label="Estación"
            valor={estacion}
            onCambio={setEstacion}
            opciones={[
              { valor: TODAS, etiqueta: "Todas" },
              ...estaciones.map((e) => ({
                valor: e,
                etiqueta: e,
                cantidad: comandas.filter((c) => c.items.some((i) => nombreEstacion(i.estacion) === e)).length,
              })),
            ]}
          />
        </div>
      )}

      {error && (
        <div className="mb-4">
          <AvisoError onReintentar={recargar}>{error}</AvisoError>
        </div>
      )}

      {cargando && comandas.length === 0 && <p className="text-sm text-pn-suave">Cargando comandas…</p>}

      {!cargando && !error && visibles.length === 0 && (
        <EstadoVacio
          titulo="Cocina al día"
          detalle="Cuando un mozo mande un pedido o entre uno por QR, aparece acá solo."
        />
      )}

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {visibles.map((c) => (
          <ComandaCard key={c.pedidoId} comanda={c} ahora={ahora} onCambio={recargar} />
        ))}
      </div>
    </div>
  );
}
