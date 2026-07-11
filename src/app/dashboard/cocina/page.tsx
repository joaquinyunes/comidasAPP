import PanelCocinaEficiencia from "@/components/cocina/PanelCocinaEficiencia";

export default function PaginaCocina() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Eficiencia en Cocina</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.6 — agrupación por estación, tiempo de cocción, código de urgencia y pausa.</p>
      <PanelCocinaEficiencia />
    </div>
  );
}
