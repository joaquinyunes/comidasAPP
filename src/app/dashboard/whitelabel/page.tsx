import PanelWhiteLabel from "@/components/whitelabel/PanelWhiteLabel";

export default function PaginaWhiteLabel() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">White-label & Multi-tenant</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.21 — theming, multi-idioma/moneda, modo franquicia, clonado de rubro y widget embebible.</p>
      <PanelWhiteLabel />
    </div>
  );
}
