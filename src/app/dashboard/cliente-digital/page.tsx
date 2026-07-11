import PanelClienteDigital from "@/components/cliente-digital/PanelClienteDigital";

export default function PaginaClienteDigital() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Experiencia Cliente Digital</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.19 — alerta de feedback, combos por reglas y QR de mesas.</p>
      <PanelClienteDigital />
    </div>
  );
}
