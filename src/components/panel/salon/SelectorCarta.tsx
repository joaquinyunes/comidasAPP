"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cantidadDe, type Carrito } from "@/lib/salon/carrito";
import Filtros from "../ui/Filtros";
import EstadoVacio from "../ui/EstadoVacio";
import FilaProducto from "./FilaProducto";
import type { CategoriaCarta, ItemCarta } from "./tipos";

interface Props {
  carta: CategoriaCarta[];
  carrito: Carrito;
  onSumar: (item: ItemCarta) => void;
  onRestar: (item: ItemCarta) => void;
}

function normalizar(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// La carta para tomar pedido: por categoría o buscando por nombre.
export default function SelectorCarta({ carta, carrito, onSumar, onRestar }: Props) {
  const [categoria, setCategoria] = useState(carta[0]?.categoria ?? "");
  const [busqueda, setBusqueda] = useState("");

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (q) {
      return carta
        .flatMap((c) => c.items)
        .filter((i) => normalizar(i.nombre).includes(q));
    }
    return carta.find((c) => c.categoria === categoria)?.items ?? [];
  }, [carta, categoria, busqueda]);

  return (
    <div>
      <label className="relative mb-3 block">
        <span className="sr-only">Buscar plato</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-pn-suave"
          aria-hidden
        />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar plato o bebida"
          className="min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel pl-9 pr-3 text-base"
        />
      </label>

      {!busqueda && (
        <div className="mb-3">
          <Filtros
            aria-label="Categorías"
            valor={categoria}
            onCambio={setCategoria}
            opciones={carta.map((c) => ({ valor: c.categoria, etiqueta: c.categoria }))}
          />
        </div>
      )}

      {visibles.length === 0 ? (
        <EstadoVacio titulo="No hay nada con ese nombre" detalle="Probá con otra palabra." />
      ) : (
        <ul className="overflow-hidden rounded-lg border border-pn-linea bg-pn-papel">
          {visibles.map((item) => (
            <FilaProducto
              key={item.id}
              item={item}
              cantidad={cantidadDe(carrito, item.id)}
              onSumar={() => onSumar(item)}
              onRestar={() => onRestar(item)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
