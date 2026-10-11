import { formatCurrency } from "@/lib/utils";
import { textoVariacion, variacionPorcentual } from "@/lib/panel/variacion";
import Cifra from "../ui/Cifra";
import type { ResumenApi } from "./tipos";

// Las cuatro cifras que un jefe mira primero al abrir el panel.
export default function CifrasTurno({ r }: { r: ResumenApi }) {
  const variacion = variacionPorcentual(r.ventasHoy, r.ventasAyer);
  const ocupacion = r.mesasTotales > 0 ? Math.round((r.mesasOcupadas / r.mesasTotales) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Cifra
        etiqueta="Vendido hoy"
        valor={formatCurrency(r.ventasHoy)}
        detalle={textoVariacion(variacion)}
        tono={variacion !== null && variacion < 0 ? "aviso" : "neutro"}
      />
      <Cifra
        etiqueta="Ticket promedio"
        valor={formatCurrency(r.ticketPromedio)}
        detalle={`${r.cobrosHoy} cobros hoy`}
      />
      <Cifra
        etiqueta="Mesas ocupadas"
        valor={`${r.mesasOcupadas} de ${r.mesasTotales}`}
        detalle={`${ocupacion}% del salón`}
      />
      <Cifra
        etiqueta="Pedidos abiertos"
        valor={String(r.pedidosActivos)}
        detalle="Sin cobrar ni cancelar"
      />
    </div>
  );
}
