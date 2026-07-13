import PanelControlDueno from "@/components/dueno/PanelControlDueno";

export default function PaginaDueno() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Control Operativo del Dueño</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.9 — platos devueltos, tiempos de servicio, mermas, mesas desatendidas y rendimiento.</p>
      <PanelControlDueno />
    </div>
  );
}
