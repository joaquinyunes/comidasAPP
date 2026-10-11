import CambiarPassword from "@/components/dashboard/CambiarPassword";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";

export default function CuentaPage() {
  return (
    <div className="mx-auto max-w-md">
      <EncabezadoPagina titulo="Mi cuenta" descripcion="Cambiá tu contraseña. Usá una que no repitas en otros lados." />
      <CambiarPassword />
    </div>
  );
}
