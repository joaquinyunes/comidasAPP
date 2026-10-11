"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useDatos } from "@/hooks/use-datos";
import { tienePermiso } from "@/lib/panel/permisos";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import Bloque from "../ui/Bloque";
import Filtros from "../ui/Filtros";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import { useSesionPanel } from "../shell/SesionContext";
import FilaProductoCarta, { type ProductoCarta } from "./FilaProductoCarta";

function normalizar(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Disponibilidad y precios. Marcar "agotado" corta la venta al instante
// en el salón y en el pedido por QR.
export default function PanelCarta() {
  const { datos, cargando, error, recargar } = useDatos<ProductoCarta[]>("/api/carta", 20000);
  const sesion = useSesionPanel();
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const productos = useMemo(() => datos ?? [], [datos]);
  const agotados = productos.filter((p) => !p.disponible).length;
  const puedeEditarPrecio = tienePermiso(sesion?.permisos, "productos:actualizar");

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return productos.filter(
      (p) => (filtro !== "agotados" || !p.disponible) && (!q || normalizar(p.nombre).includes(q))
    );
  }, [productos, filtro, busqueda]);

  const categorias = [...new Set(visibles.map((p) => p.categoria))];

  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina
        titulo="Carta"
        descripcion={
          agotados > 0
            ? `${agotados} ${agotados === 1 ? "plato agotado" : "platos agotados"} ahora. Los mozos y los clientes ya no pueden pedirlos.`
            : "Si se termina algo, apagalo acá y deja de ofrecerse al instante."
        }
      />

      {error && !datos && <AvisoError onReintentar={recargar}>{error}</AvisoError>}
      {cargando && !datos && <p className="text-sm text-pn-suave">Cargando la carta…</p>}

      {datos && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="relative min-w-52 flex-1">
              <span className="sr-only">Buscar en la carta</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pn-suave"
                aria-hidden
              />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar plato o bebida"
                className="min-h-10 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel pl-9 pr-3 text-base"
              />
            </label>
            <Filtros
              aria-label="Disponibilidad"
              valor={filtro}
              onCambio={setFiltro}
              opciones={[
                { valor: "todos", etiqueta: "Todos", cantidad: productos.length },
                { valor: "agotados", etiqueta: "Agotados", cantidad: agotados },
              ]}
            />
          </div>

          {visibles.length === 0 ? (
            <EstadoVacio
              titulo={filtro === "agotados" ? "No hay nada agotado" : "No encontramos ese producto"}
              detalle={filtro === "agotados" ? "Todo lo de la carta está disponible." : "Probá con otra palabra."}
            />
          ) : (
            <div className="space-y-4">
              {categorias.map((cat) => (
                <Bloque key={cat} titulo={cat} sinPadding>
                  <ul className="divide-y divide-pn-linea">
                    {visibles
                      .filter((p) => p.categoria === cat)
                      .map((p) => (
                        <FilaProductoCarta
                          key={p.id}
                          producto={p}
                          puedeEditarPrecio={puedeEditarPrecio}
                          onCambio={recargar}
                        />
                      ))}
                  </ul>
                </Bloque>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
