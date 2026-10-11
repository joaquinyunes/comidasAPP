import { formatCurrency } from "@/lib/utils";
import Bloque from "../ui/Bloque";
import type { VentaDia } from "./tipos";

function etiquetaDia(fecha: string): { corta: string; larga: string } {
  // Mediodía fijo: evita que la zona horaria corra el día.
  const d = new Date(`${fecha}T12:00:00`);
  return {
    corta: d.toLocaleDateString("es-AR", { weekday: "narrow" }),
    larga: d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }),
  };
}

// Ventas de los últimos días como barras; el valor exacto está en el
// título de cada barra y en la tabla para lectores de pantalla.
export default function VentasPorDia({ dias }: { dias: VentaDia[] }) {
  const maximo = Math.max(1, ...dias.map((d) => d.total));
  const total = dias.reduce((s, d) => s + d.total, 0);
  const mejor = dias.reduce((m, d) => (d.total > m.total ? d : m), dias[0]);
  const promedio = dias.length ? total / dias.length : 0;

  return (
    <Bloque
      titulo="Ventas por día"
      nota={`Últimos ${dias.length} días · promedio ${formatCurrency(promedio)} por día`}
    >
      {total === 0 ? (
        <p className="text-sm text-pn-suave">Todavía no hay cobros en este período.</p>
      ) : (
        <>
          <div className="flex h-44 items-end gap-1.5" role="img" aria-label="Gráfico de ventas por día">
            {dias.map((d) => {
              const { larga } = etiquetaDia(d.fecha);
              const alto = Math.max(2, Math.round((d.total / maximo) * 100));
              const esMejor = d.fecha === mejor?.fecha && d.total > 0;
              return (
                <div key={d.fecha} className="flex h-full flex-1 flex-col justify-end" title={`${larga}: ${formatCurrency(d.total)}`}>
                  <div
                    className={`w-full rounded-t ${esMejor ? "bg-pn-marca" : "bg-pn-tinta"}`}
                    style={{ height: `${alto}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex gap-1.5">
            {dias.map((d) => (
              <span key={d.fecha} className="pn-num flex-1 text-center text-[11px] text-pn-suave">
                {etiquetaDia(d.fecha).corta}
                <br />
                {Number(d.fecha.slice(8))}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-pn-suave">
            Mejor día:{" "}
            <span className="font-medium text-pn-tinta">
              {etiquetaDia(mejor.fecha).larga} ({formatCurrency(mejor.total)})
            </span>
            .
          </p>

          <table className="sr-only">
            <caption>Ventas por día</caption>
            <thead>
              <tr>
                <th>Día</th>
                <th>Cobrado</th>
                <th>Cobros</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((d) => (
                <tr key={d.fecha}>
                  <td>{etiquetaDia(d.fecha).larga}</td>
                  <td>{formatCurrency(d.total)}</td>
                  <td>{d.cobros}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Bloque>
  );
}
