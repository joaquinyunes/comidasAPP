"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useDatos } from "@/hooks/use-datos";
import { formatCurrency } from "@/lib/utils";
import { resumirStock } from "@/lib/inventario/resumir-stock";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import Cifra from "../ui/Cifra";
import Bloque from "../ui/Bloque";
import Filtros from "../ui/Filtros";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import FilaIngrediente from "./FilaIngrediente";
import FormularioMovimiento from "./FormularioMovimiento";
import type { IngredienteStock } from "./tipos";

function normalizar(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Stock real del local: qué hay, qué falta y qué pasó con cada ingrediente.
export default function PanelInventario() {
  const { datos, cargando, error, recargar } = useDatos<IngredienteStock[]>("/api/inventario?limit=100", 30000);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [moviendo, setMoviendo] = useState<IngredienteStock | null>(null);

  const items = useMemo(() => datos ?? [], [datos]);
  const resumen = useMemo(() => resumirStock(items), [items]);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return items.filter((i) => {
      if (filtro === "falta" && i.estado === "ok") return false;
      if (filtro === "critico" && i.estado !== "critico") return false;
      if (q && !normalizar(i.ingrediente.nombre).includes(q)) return false;
      return true;
    });
  }, [items, filtro, busqueda]);

  return (
    <div className="mx-auto max-w-4xl">
      <EncabezadoPagina
        titulo="Inventario"
        descripcion="Lo que hay en el local. Cada vez que llega, se usa o se tira algo, registralo con el botón de la fila."
      />

      {error && !datos && (
        <AvisoError onReintentar={recargar}>{error}</AvisoError>
      )}
      {cargando && !datos && <p className="text-sm text-pn-suave">Cargando el stock…</p>}

      {datos && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Cifra etiqueta="Ingredientes" valor={String(resumen.total)} />
            <Cifra
              etiqueta="Se están acabando"
              valor={String(resumen.criticos)}
              tono={resumen.criticos > 0 ? "peligro" : "neutro"}
            />
            <Cifra
              etiqueta="Por debajo del mínimo"
              valor={String(resumen.bajos)}
              tono={resumen.bajos > 0 ? "aviso" : "neutro"}
            />
            <Cifra etiqueta="Valor del stock" valor={formatCurrency(resumen.valorTotal)} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-52 flex-1">
              <span className="sr-only">Buscar ingrediente</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pn-suave"
                aria-hidden
              />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar ingrediente"
                className="min-h-10 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel pl-9 pr-3 text-base"
              />
            </label>
            <Filtros
              aria-label="Estado del stock"
              valor={filtro}
              onCambio={setFiltro}
              opciones={[
                { valor: "todos", etiqueta: "Todos" },
                { valor: "falta", etiqueta: "Falta", cantidad: resumen.criticos + resumen.bajos },
                { valor: "critico", etiqueta: "Se acaban", cantidad: resumen.criticos },
              ]}
            />
          </div>

          {visibles.length === 0 ? (
            <EstadoVacio
              titulo={items.length === 0 ? "Todavía no hay ingredientes cargados" : "Nada coincide con el filtro"}
              detalle={items.length === 0 ? "Se cargan desde Configuración." : "Probá con otra búsqueda."}
            />
          ) : (
            <Bloque sinPadding>
              <ul className="divide-y divide-pn-linea">
                {visibles.map((i) => (
                  <FilaIngrediente key={i.id} item={i} onMover={() => setMoviendo(i)} />
                ))}
              </ul>
            </Bloque>
          )}
        </div>
      )}

      {moviendo && (
        <FormularioMovimiento
          item={moviendo}
          onCerrar={() => setMoviendo(null)}
          onListo={() => {
            setMoviendo(null);
            void recargar();
          }}
        />
      )}
    </div>
  );
}
