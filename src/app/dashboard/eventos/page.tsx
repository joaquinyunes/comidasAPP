import PanelEventos from "@/components/eventos/PanelEventos";

export default function PaginaEventos() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Modo Eventos / Pedidos Grandes</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.14 — flujo separado de eventos, programación y bandeja de cocina.</p>
      <PanelEventos />
    </div>
  );
}
