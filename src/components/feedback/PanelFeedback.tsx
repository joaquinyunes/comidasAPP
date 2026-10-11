"use client";

import { useDatos } from "@/hooks/use-datos";
import Bloque from "@/components/panel/ui/Bloque";
import Cifra from "@/components/panel/ui/Cifra";
import AvisoError from "@/components/panel/ui/AvisoError";

interface Queja {
  id: string;
  motivo: string | null;
  mesa: number | null;
  fecha: string;
}

interface FeedbackResumen {
  total: number;
  porCalificacion: Record<string, number>;
  felizPct: number;
  tristes: Queja[];
  alertaDueno: boolean;
}

function cuando(fecha: string): string {
  return new Date(fecha).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// Qué dicen los clientes al cerrar su mesa.
export default function PanelFeedback() {
  const { datos, cargando, error, recargar } = useDatos<FeedbackResumen>("/api/feedback/resumen", 0);

  if (cargando && !datos) return <p className="text-sm text-pn-suave">Cargando opiniones…</p>;
  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (!datos) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Cifra etiqueta="Opiniones (30 días)" valor={String(datos.total)} />
        <Cifra
          etiqueta="Clientes contentos"
          valor={`${datos.felizPct}%`}
          tono={datos.total > 0 && datos.felizPct < 70 ? "aviso" : "neutro"}
        />
        <Cifra
          etiqueta="Quejas"
          valor={String(datos.tristes.length)}
          tono={datos.tristes.length > 0 ? "peligro" : "neutro"}
        />
      </div>

      <Bloque titulo="Quejas recientes" nota="Para responder o corregir" sinPadding>
        {datos.tristes.length === 0 ? (
          <p className="px-4 py-5 text-sm text-pn-suave">No hubo quejas. Buen turno.</p>
        ) : (
          <ul className="divide-y divide-pn-linea">
            {datos.tristes.map((t) => (
              <li key={t.id} className="px-4 py-3">
                <p className="text-sm font-medium">{t.motivo ?? "Sin motivo"}</p>
                <p className="mt-0.5 text-xs text-pn-suave">
                  {t.mesa ? `Mesa ${t.mesa} · ` : ""}
                  {cuando(t.fecha)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Bloque>
    </div>
  );
}
