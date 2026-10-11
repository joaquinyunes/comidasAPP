import CajaResumenCard from "@/components/caja-resumen/CajaResumenCard";
import PedidosPorCobrar from "@/components/pedidos-panel/PedidosPorCobrar";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";

export default function CajaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <EncabezadoPagina titulo="Caja" descripcion="Cobrá los pedidos abiertos y controlá lo que entró en el día." />
      <PedidosPorCobrar />
      <CajaResumenCard />
    </div>
  );
}
