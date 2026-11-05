import CambiarPassword from "@/components/dashboard/CambiarPassword";
import ActivarDosFactores from "@/components/dashboard/ActivarDosFactores";
import CerrarTodasLasSesiones from "@/components/dashboard/CerrarTodasLasSesiones";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";

export default function CuentaPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <EncabezadoPagina titulo="Mi cuenta" descripcion="Cambiá tu contraseña. Usá una que no repitas en otros lados." />
      <CambiarPassword />
      <ActivarDosFactores />
      <CerrarTodasLasSesiones />
    </div>
  );
}
