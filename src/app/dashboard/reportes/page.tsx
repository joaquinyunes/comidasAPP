import PanelReportes from "@/components/reportes/PanelReportes";

export default function PaginaReportes() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Reportes, Demos y Onboarding</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.22 — exportador, comparación de sucursales, modo demo y onboarding interactivo.</p>
      <PanelReportes />
    </div>
  );
}
