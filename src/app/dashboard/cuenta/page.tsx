import CambiarPassword from "@/components/dashboard/CambiarPassword";

export default function CuentaPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-1 text-2xl font-bold">Mi cuenta</h1>
      <p className="mb-6 text-sm text-zinc-500">Cambiá tu contraseña.</p>
      <CambiarPassword />
    </div>
  );
}
