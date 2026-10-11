import PanelDelivery from "@/components/delivery/PanelDelivery";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";

export default function PaginaDelivery() {
  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina
        titulo="Delivery"
        descripcion="Repartos en curso. Avanzá cada uno cuando sale y cuando se entrega."
      />
      <PanelDelivery />
    </div>
  );
}
