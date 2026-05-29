import PanelCompras from "@/components/compras/PanelCompras";

export default function PaginaCompras() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Compras y Proveedores</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.11 — sugerencia automática de compra por quiebre de stock.</p>
      <PanelCompras />
    </div>
  );
}
