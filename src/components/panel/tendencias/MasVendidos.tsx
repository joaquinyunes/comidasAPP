import { formatCurrency } from "@/lib/utils";
import Bloque from "../ui/Bloque";
import type { MasVendido } from "./tipos";

// Qué se vende más (y qué deja más plata), para decidir qué empujar y qué comprar.
export default function MasVendidos({ items }: { items: MasVendido[] }) {
  const maximo = Math.max(1, ...items.map((i) => i.unidades));

  return (
    <Bloque titulo="Lo que más se vende" nota="Últimos 30 días, por unidades">
      {items.length === 0 ? (
        <p className="text-sm text-pn-suave">Todavía no hay ventas para comparar.</p>
      ) : (
        <ol className="space-y-3">
          {items.map((i, n) => (
            <li key={i.productoId}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  <span className="pn-num mr-2 text-pn-suave">{n + 1}</span>
                  <span className="font-medium">{i.nombre}</span>
                </span>
                <span className="pn-num shrink-0">
                  <span className="font-semibold">{i.unidades}</span>
                  <span className="ml-2 text-xs text-pn-suave">{formatCurrency(i.facturado)}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-pn-hundido" aria-hidden>
                <div className="h-full rounded-full bg-pn-tinta" style={{ width: `${Math.round((i.unidades / maximo) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Bloque>
  );
}
