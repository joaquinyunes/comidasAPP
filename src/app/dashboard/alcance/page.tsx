import PanelAlcance from "@/components/alcance/PanelAlcance";

export default function PaginaAlcance() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Accesibilidad y Alcance del Cliente</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.15 — menú multidioma, multi-moneda, alto contraste y productos turísticos.</p>
      <PanelAlcance />
    </div>
  );
}
