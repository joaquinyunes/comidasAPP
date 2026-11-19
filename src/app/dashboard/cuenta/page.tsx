import CambiarPassword from "@/components/dashboard/CambiarPassword";
import ActivarDosFactores from "@/components/dashboard/ActivarDosFactores";
import CerrarTodasLasSesiones from "@/components/dashboard/CerrarTodasLasSesiones";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";

export default async function CuentaPage({ searchParams }: { searchParams: Promise<{ obligatorio?: string }> }) {
  const { obligatorio } = await searchParams;
  return (
    <div className="mx-auto max-w-md space-y-4">
      <EncabezadoPagina titulo="Mi cuenta" descripcion="Cambiá tu contraseña. Usá una que no repitas en otros lados." />
      {obligatorio && (
        <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Para usar el panel como administrador tenés que activar la verificación en dos pasos. Hacelo acá abajo y seguí.
        </p>
      )}
      <CambiarPassword />
      <ActivarDosFactores />
      <CerrarTodasLasSesiones />
    </div>
  );
}
