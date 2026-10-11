"use client";

import { useDatos } from "@/hooks/use-datos";
import { formatCurrency } from "@/lib/utils";
import Bloque from "../ui/Bloque";
import Cifra from "../ui/Cifra";
import AvisoError from "../ui/AvisoError";

interface Logistica {
  totalClientes: number;
  cuponesActivos: number;
  porNivel: Record<string, number>;
  topClientes: { id: string; nombre: string; puntos: number }[];
}

interface Recurrente {
  id: string;
  nombre: string;
  nivel: string;
  totalVisitas: number;
  puntos: number;
  totalGastado: number | string;
}

// Cómo anda el programa de puntos: cuánta gente, de qué nivel y quiénes
// vuelven más.
export default function ProgramaPuntos() {
  const logistica = useDatos<Logistica>("/api/fidelizacion/logistica", 0);
  const recurrentes = useDatos<Recurrente[]>("/api/fidelizacion/clientes-recurrentes", 0);

  if (logistica.error && !logistica.datos) {
    return <AvisoError onReintentar={logistica.recargar}>{logistica.error}</AvisoError>;
  }
  if (!logistica.datos) return <p className="text-sm text-pn-suave">Cargando el programa…</p>;

  const l = logistica.datos;
  const niveles = Object.entries(l.porNivel);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Cifra etiqueta="Clientes en el programa" valor={String(l.totalClientes)} />
        <Cifra etiqueta="Cupones activos" valor={String(l.cuponesActivos)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloque titulo="Por nivel">
          {niveles.length === 0 ? (
            <p className="text-sm text-pn-suave">Todavía no hay clientes con nivel.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {niveles.map(([nivel, n]) => (
                <li key={nivel} className="flex justify-between">
                  <span className="capitalize">{nivel}</span>
                  <span className="pn-num font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </Bloque>

        <Bloque titulo="Los que más vuelven" nota="Por visitas">
          {(recurrentes.datos ?? []).length === 0 ? (
            <p className="text-sm text-pn-suave">Todavía no hay clientes recurrentes.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(recurrentes.datos ?? []).slice(0, 8).map((c) => (
                <li key={c.id} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">{c.nombre}</span>
                  <span className="pn-num shrink-0 text-xs text-pn-suave">
                    {c.totalVisitas} visitas · {formatCurrency(Number(c.totalGastado))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Bloque>
      </div>
    </div>
  );
}
