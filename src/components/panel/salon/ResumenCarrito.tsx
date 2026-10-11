import { formatCurrency } from "@/lib/utils";
import type { Carrito } from "@/lib/salon/carrito";

interface Props {
  carrito: Carrito;
  onNota: (productoId: string, nota: string) => void;
}

// Lo que se va a mandar a cocina, con una nota opcional por plato
// ("sin cebolla", "bien cocida"). La cocina la ve en la comanda.
export default function ResumenCarrito({ carrito, onNota }: Props) {
  if (carrito.length === 0) return null;

  return (
    <section aria-label="Pedido armado" className="mt-5">
      <h3 className="mb-2 text-sm font-semibold">Se manda a cocina</h3>
      <ul className="divide-y divide-pn-linea rounded-lg border border-pn-linea bg-pn-papel">
        {carrito.map((l) => (
          <li key={l.productoId} className="px-3 py-2.5">
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-medium">
                <span className="pn-num">{l.cantidad}×</span> {l.nombre}
              </span>
              <span className="pn-num text-pn-suave">{formatCurrency(l.precio * l.cantidad)}</span>
            </div>
            <input
              type="text"
              value={l.notas}
              maxLength={200}
              onChange={(e) => onNota(l.productoId, e.target.value)}
              placeholder="Nota para la cocina (opcional)"
              aria-label={`Nota para ${l.nombre}`}
              className="mt-1.5 min-h-10 w-full rounded-md border border-pn-linea bg-pn-fondo px-2.5 text-sm"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
