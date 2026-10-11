"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useDatos } from "@/hooks/use-datos";
import { mesasParaAtender, resumirSalon } from "@/lib/salon/resumir-salon";
import EncabezadoPagina from "../ui/EncabezadoPagina";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import Boton from "../ui/Boton";
import Filtros from "../ui/Filtros";
import ResumenSalon from "./ResumenSalon";
import ParaAtender from "./ParaAtender";
import GrillaSalon from "./GrillaSalon";
import DetalleMesa from "./DetalleMesa";
import TomarPedido from "./TomarPedido";
import type { MesaSalon } from "./tipos";

const TODOS = "todos";

// Pantalla del mozo: el salón vivo, lo que espera atención y, al tocar
// una mesa, todo lo que puede hacer con ella.
export default function PanelSalon() {
  const { datos, cargando, error, recargar } = useDatos<MesaSalon[]>("/api/salon/mesas", 8000);
  const [mesaId, setMesaId] = useState<string | null>(null);
  const [tomando, setTomando] = useState(false);
  const [sector, setSector] = useState(TODOS);

  const mesas = useMemo(() => datos ?? [], [datos]);
  const sectores = useMemo(() => [...new Set(mesas.map((m) => m.sector))], [mesas]);
  const visibles = sector === TODOS ? mesas : mesas.filter((m) => m.sector === sector);
  const mesa = mesas.find((m) => m.id === mesaId) ?? null;

  const resumen = useMemo(() => resumirSalon(mesas), [mesas]);
  const atenciones = useMemo(() => mesasParaAtender(mesas), [mesas]);

  return (
    <div className="mx-auto max-w-6xl">
      <EncabezadoPagina
        titulo="Salón"
        descripcion="Tocá una mesa para tomar pedido, ver qué falta o cobrar."
        acciones={
          <Boton onClick={recargar} aria-label="Actualizar el salón">
            <RefreshCw className="size-4" aria-hidden />
            Actualizar
          </Boton>
        }
      />

      {error && (
        <div className="mb-4">
          <AvisoError onReintentar={recargar}>{error}</AvisoError>
        </div>
      )}

      {cargando && !datos && <p className="text-sm text-pn-suave">Cargando el salón…</p>}

      {datos && mesas.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hay mesas cargadas"
          detalle="Un administrador puede cargarlas desde Configuración."
        />
      )}

      {mesas.length > 0 && (
        <>
          <ResumenSalon r={resumen} />
          <ParaAtender atenciones={atenciones} onElegir={setMesaId} />

          {sectores.length > 1 && (
            <div className="mb-4">
              <Filtros
                aria-label="Sector"
                valor={sector}
                onCambio={setSector}
                opciones={[
                  { valor: TODOS, etiqueta: "Todo el salón" },
                  ...sectores.map((s) => ({ valor: s, etiqueta: s })),
                ]}
              />
            </div>
          )}

          <GrillaSalon mesas={visibles} seleccionada={mesaId} onElegir={setMesaId} />
        </>
      )}

      {mesa && !tomando && (
        <DetalleMesa
          mesa={mesa}
          onCerrar={() => setMesaId(null)}
          onTomarPedido={() => setTomando(true)}
          onCambio={recargar}
        />
      )}

      {mesa && tomando && (
        <TomarPedido
          mesaId={mesa.id}
          numeroMesa={mesa.numero}
          onCerrar={() => setTomando(false)}
          onEnviado={() => {
            setTomando(false);
            void recargar();
          }}
        />
      )}
    </div>
  );
}
