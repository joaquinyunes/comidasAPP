import PanelMantenimiento from "@/components/mantenimiento/PanelMantenimiento";

export default function PaginaMantenimiento() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Mantenimiento de Equipos</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.13 — recordatorios, temperatura, plan de limpieza e historial de intervenciones.</p>
      <PanelMantenimiento />
    </div>
  );
}
