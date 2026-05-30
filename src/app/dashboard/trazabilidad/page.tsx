import PanelTrazabilidad from "@/components/trazabilidad/PanelTrazabilidad";

export default function PaginaTrazabilidad() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Trazabilidad y Responsabilidad</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.12 — log de anulaciones, eventos y quién hizo qué.</p>
      <PanelTrazabilidad />
    </div>
  );
}
