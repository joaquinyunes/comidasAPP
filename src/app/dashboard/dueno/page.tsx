import PanelControlDueno from "@/components/dueno/PanelControlDueno";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";

export default function PaginaDueno() {
  return (
    <div className="mx-auto max-w-5xl">
      <EncabezadoPagina
        titulo="Control del dueño"
        descripcion="Platos anulados, tiempos de cocina, faltantes y desempeño del equipo."
      />
      <PanelControlDueno />
    </div>
  );
}
