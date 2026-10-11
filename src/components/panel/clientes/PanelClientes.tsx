"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useDatos } from "@/hooks/use-datos";
import { perteneceA, type Segmento } from "@/lib/clientes/segmentar";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import Bloque from "../ui/Bloque";
import Filtros from "../ui/Filtros";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import FilaCliente, { type ClientePanel } from "./FilaCliente";

function normalizar(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const SEGMENTOS: { valor: Segmento; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "frecuentes", etiqueta: "Frecuentes" },
  { valor: "por_recuperar", etiqueta: "Por recuperar" },
  { valor: "nuevos", etiqueta: "Nuevos" },
];

const AYUDA: Record<Segmento, string> = {
  todos: "Todos los clientes, de más a menos gastado.",
  frecuentes: "Vinieron 3 veces o más. Son los que hay que cuidar.",
  por_recuperar: "Vinieron más de una vez pero hace 30 días o más que no vuelven. Un mensaje a tiempo los trae de vuelta.",
  nuevos: "Una sola visita. Falta que vuelvan.",
};

export default function PanelClientes() {
  const { datos, cargando, error, recargar } = useDatos<ClientePanel[]>("/api/clientes?limit=200", 0);
  const [segmento, setSegmento] = useState<Segmento>("todos");
  const [busqueda, setBusqueda] = useState("");

  const clientes = useMemo(() => datos ?? [], [datos]);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return clientes.filter(
      (c) =>
        perteneceA(c, segmento) &&
        (!q || normalizar(c.nombre).includes(q) || (c.telefono ?? "").includes(q) || normalizar(c.email ?? "").includes(q))
    );
  }, [clientes, segmento, busqueda]);

  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina titulo="Clientes" descripcion={AYUDA[segmento]} />

      {error && !datos && <AvisoError onReintentar={recargar}>{error}</AvisoError>}
      {cargando && !datos && <p className="text-sm text-pn-suave">Cargando clientes…</p>}

      {datos && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="relative min-w-52 flex-1">
              <span className="sr-only">Buscar cliente</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pn-suave"
                aria-hidden
              />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, teléfono o email"
                className="min-h-10 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel pl-9 pr-3 text-base"
              />
            </label>
            <Filtros
              aria-label="Segmento de clientes"
              valor={segmento}
              onCambio={(v) => setSegmento(v as Segmento)}
              opciones={SEGMENTOS.map((s) => ({
                ...s,
                cantidad: clientes.filter((c) => perteneceA(c, s.valor)).length,
              }))}
            />
          </div>

          {visibles.length === 0 ? (
            <EstadoVacio
              titulo={clientes.length === 0 ? "Todavía no hay clientes" : "Nadie coincide"}
              detalle={
                clientes.length === 0
                  ? "Se cargan solos cuando alguien reserva o pide con sus datos."
                  : "Probá con otro segmento o búsqueda."
              }
            />
          ) : (
            <Bloque sinPadding>
              <ul className="divide-y divide-pn-linea">
                {visibles.map((c) => (
                  <FilaCliente key={c.id} cliente={c} />
                ))}
              </ul>
            </Bloque>
          )}
        </>
      )}
    </div>
  );
}
