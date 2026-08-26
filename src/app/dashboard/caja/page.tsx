import CajaResumenCard from "@/components/caja-resumen/CajaResumenCard";
import PedidosPorCobrar from "@/components/pedidos-panel/PedidosPorCobrar";

export default function CajaPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Caja</h1>
      <CajaResumenCard />
      <PedidosPorCobrar />
    </div>
  );
}
