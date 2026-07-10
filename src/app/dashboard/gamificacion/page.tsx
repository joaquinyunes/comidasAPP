import PanelGamificacion from "@/components/gamificacion/PanelGamificacion";

export default function PaginaGamificacion() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Gamificación Operativa</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.18 — ranking de tiempos, cero errores y tablero de métricas.</p>
      <PanelGamificacion />
    </div>
  );
}
