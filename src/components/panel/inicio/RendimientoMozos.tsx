import Bloque from "../ui/Bloque";
import type { ControlApi } from "./tipos";

// Pedidos tomados por cada mozo en los últimos 30 días.
export default function RendimientoMozos({ filas }: { filas: ControlApi["rendimiento"] }) {
  const maximo = Math.max(1, ...filas.map((f) => f.pedidos));

  return (
    <Bloque titulo="Pedidos por mozo" nota="Últimos 30 días">
      {filas.length === 0 ? (
        <p className="text-sm text-pn-suave">Todavía no hay pedidos asignados a un mozo.</p>
      ) : (
        <ul className="space-y-3">
          {filas.map((f, i) => (
            <li key={`${f.mozo}-${i}`}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{f.mozo ?? "Sin asignar"}</span>
                <span className="pn-num text-pn-suave">{f.pedidos}</span>
              </div>
              <div className="h-1.5 rounded-full bg-pn-hundido">
                <div
                  className="h-full rounded-full bg-pn-tinta"
                  style={{ width: `${Math.round((f.pedidos / maximo) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Bloque>
  );
}
