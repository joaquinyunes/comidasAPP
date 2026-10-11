import PanelCompras from "@/components/compras/PanelCompras";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";

export default function PaginaCompras() {
  return (
    <div className="mx-auto max-w-3xl">
      <EncabezadoPagina
        titulo="Compras"
        descripcion="Lo que conviene pedir a proveedores según el stock actual y los mínimos."
      />
      <PanelCompras />
    </div>
  );
}
