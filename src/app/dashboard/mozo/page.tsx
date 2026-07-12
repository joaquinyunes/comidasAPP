import PanelMozo from "@/components/mozo/PanelMozo";

export default function PaginaMozo() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Mozo en el Salón</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.7 — mapa semáforo, alergias bloqueantes, disponibilidad y ayuda con la cuenta.</p>
      <PanelMozo />
    </div>
  );
}
