"use client";

import { useId, useState } from "react";
import { Search } from "lucide-react";
import { useDatos } from "@/hooks/use-datos";
import { useDebounce } from "@/hooks/use-debounce";
import Etiqueta from "../ui/Etiqueta";

export interface ClienteBusqueda {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  puntos: number;
  nivel: string;
  alergias: string[];
}

interface Props {
  onElegir: (c: ClienteBusqueda) => void;
}

// Busca un cliente por nombre, teléfono o email. Nadie tiene que copiar un ID.
export default function BuscadorCliente({ onElegir }: Props) {
  const id = useId();
  const [q, setQ] = useState("");
  const consulta = useDebounce(q.trim(), 300);
  const url = consulta.length >= 2 ? `/api/clientes?limit=8&q=${encodeURIComponent(consulta)}` : null;
  const { datos, cargando } = useDatos<ClienteBusqueda[]>(url, 0);
  const resultados = url ? (datos ?? []) : [];

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        Cliente
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pn-suave" aria-hidden />
        <input
          id={id}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre, teléfono o email"
          autoComplete="off"
          className="min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel pl-9 pr-3 text-base"
        />
      </div>

      {url && (
        <ul className="mt-2 overflow-hidden rounded-lg border border-pn-linea bg-pn-papel">
          {cargando && !datos && <li className="px-3 py-2.5 text-sm text-pn-suave">Buscando…</li>}
          {!cargando && resultados.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-pn-suave">No hay nadie con “{consulta}”.</li>
          )}
          {resultados.map((c) => (
            <li key={c.id} className="border-b border-pn-linea last:border-b-0">
              <button
                type="button"
                onClick={() => {
                  onElegir(c);
                  setQ("");
                }}
                className="flex min-h-12 w-full items-center justify-between gap-3 px-3 text-left hover:bg-pn-hundido"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{c.nombre}</span>
                  <span className="block truncate text-xs text-pn-suave">{c.telefono ?? c.email ?? "Sin contacto"}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {c.alergias.length > 0 && <Etiqueta tono="peligro">Alergias</Etiqueta>}
                  <Etiqueta>{c.nivel}</Etiqueta>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
