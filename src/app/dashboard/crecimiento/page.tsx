import PanelCrecimiento from "@/components/crecimiento/PanelCrecimiento";

export default function PaginaCrecimiento() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Crecimiento, Ventas y Licencias</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.23 — planes y licencias, activación de módulos, upgrade de autoservicio y métricas de venta.</p>
      <PanelCrecimiento />
    </div>
  );
}
