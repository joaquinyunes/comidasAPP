import PanelDelivery from "@/components/delivery/PanelDelivery";

export default function PaginaDelivery() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Delivery Propio</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.10 — asignación de repartidor, estado en vivo y zonas de reparto.</p>
      <PanelDelivery />
    </div>
  );
}
