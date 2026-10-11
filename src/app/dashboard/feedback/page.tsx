import PanelFeedback from "@/components/feedback/PanelFeedback";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";

export default function PaginaOpiniones() {
  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina titulo="Opiniones" descripcion="Lo que los clientes calificaron al cerrar su mesa." />
      <PanelFeedback />
    </div>
  );
}
