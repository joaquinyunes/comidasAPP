"use client";

import { useMesaStore } from "@/lib/store";
import { MESA_COLORES, MESA_LABELS, type Mesa, type MesaEstado } from "@/types";
import { cn } from "@/lib/utils";

// ============================================
// GEMELO DIGITAL - Plano Interactivo del Restaurante
// ============================================

interface GemeloDigitalProps {
  onMesaClick?: (mesa: Mesa) => void;
  editable?: boolean;
  className?: string;
}

export function GemeloDigital({
  onMesaClick,
  editable = false,
  className,
}: GemeloDigitalProps) {
  const { mesas, mesaSeleccionada, seleccionarMesa } = useMesaStore();

  const handleClick = (mesa: Mesa) => {
    seleccionarMesa(mesa.id);
    onMesaClick?.(mesa);
  };

  // Agrupar mesas por sector
  const sectores = mesas.reduce((acc, mesa) => {
    const sector = mesa.sector || "General";
    if (!acc[sector]) acc[sector] = [];
    acc[sector].push(mesa);
    return acc;
  }, {} as Record<string, Mesa[]>);

  return (
    <div className={cn("bg-white rounded-xl border p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">🗺️ Gemelo Digital</h2>
        <div className="flex gap-2 text-xs">
          {Object.entries(MESA_COLORES).map(([estado, color]) => (
            <div key={estado} className="flex items-center gap-1">
              <div className={cn("w-3 h-3 rounded-full", color)} />
              <span className="text-gray-600">{MESA_LABELS[estado as MesaEstado]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(sectores).map(([sector, mesasSector]) => (
          <div key={sector}>
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              {sector}
            </h3>
            <div className="flex flex-wrap gap-3">
              {mesasSector.map((mesa) => (
                <MesaCard
                  key={mesa.id}
                  mesa={mesa}
                  seleccionada={mesaSeleccionada === mesa.id}
                  onClick={() => handleClick(mesa)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {mesas.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🗺️</p>
          <p>No hay mesas configuradas</p>
          <p className="text-sm">Agregá mesas desde el panel de configuración</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// TARJETA DE MESA
// ============================================

interface MesaCardProps {
  mesa: Mesa;
  seleccionada: boolean;
  onClick: () => void;
}

function MesaCard({ mesa, seleccionada, onClick }: MesaCardProps) {
  const color = MESA_COLORES[mesa.estado];
  const label = MESA_LABELS[mesa.estado];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:scale-105",
        seleccionada
          ? "border-red-500 shadow-lg ring-2 ring-red-200"
          : "border-transparent hover:border-gray-200",
        "bg-white"
      )}
    >
      {/* Indicador de estado */}
      <div
        className={cn(
          "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
          color
        )}
      />

      {/* Número de mesa */}
      <span className="text-2xl font-bold text-gray-800 mb-1">
        {mesa.numero}
      </span>

      {/* Capacidad */}
      <span className="text-xs text-gray-500 mb-2">
        {mesa.capacidad} personas
      </span>

      {/* Estado */}
      <span
        className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          color,
          "text-white"
        )}
      >
        {label}
      </span>

      {/* Info adicional si está ocupada */}
      {mesa.estado !== "libre" && mesa.estado !== "reservada" && mesa.estado !== "limpieza" && (
        <div className="mt-2 text-xs text-gray-600 space-y-0.5">
          {mesa.tiempoSentado && (
            <p>⏱️ {mesa.tiempoSentado} min</p>
          )}
          {mesa.totalConsumido !== undefined && (
            <p>💰 ${mesa.totalConsumido.toLocaleString()}</p>
          )}
        </div>
      )}
    </button>
  );
}

// ============================================
// PANEL DE DETALLE DE MESA
// ============================================

interface MesaDetalleProps {
  mesa: Mesa | null;
  onCerrar: () => void;
  onCobrar?: (mesaId: string) => void;
}

export function MesaDetalle({ mesa, onCerrar, onCobrar }: MesaDetalleProps) {
  if (!mesa) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Mesa {mesa.numero}</h3>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <InfoItem label="Estado" value={MESA_LABELS[mesa.estado]} />
          <InfoItem label="Capacidad" value={`${mesa.capacidad} personas`} />
          {mesa.mozo && <InfoItem label="Mozo" value={mesa.mozo} />}
          {mesa.tiempoSentado && (
            <InfoItem label="Tiempo sentado" value={`${mesa.tiempoSentado} min`} />
          )}
          {mesa.totalConsumido !== undefined && (
            <InfoItem label="Total consumido" value={`$${mesa.totalConsumido.toLocaleString()}`} />
          )}
        </div>

        {/* Pedido actual */}
        {mesa.pedidoActual && (
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Pedido actual</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              {mesa.pedidoActual.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.cantidad}x {item.producto?.nombre || "Item"}
                  </span>
                  <span className="text-gray-500">
                    ${item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          {mesa.estado === "esperando_cuenta" && onCobrar && (
            <button
              onClick={() => onCobrar(mesa.id)}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              💰 Cobrar
            </button>
          )}
          <button
            onClick={onCerrar}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
