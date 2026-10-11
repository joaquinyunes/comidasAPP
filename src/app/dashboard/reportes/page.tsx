import PanelReportes from "@/components/reportes/PanelReportes";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";

export default function PaginaReportes() {
  return (
    <div className="mx-auto max-w-4xl">
      <EncabezadoPagina titulo="Reportes" descripcion="Cómo viene el negocio en los últimos 30 días." />
      <PanelReportes />
    </div>
  );
}
