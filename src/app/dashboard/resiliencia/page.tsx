import PanelResiliencia from "@/components/resiliencia/PanelResiliencia";

export default function PaginaResiliencia() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Resiliencia del Negocio</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.17 — estado del sistema, modo solo-cobro y verificación de integridad.</p>
      <PanelResiliencia />
    </div>
  );
}
