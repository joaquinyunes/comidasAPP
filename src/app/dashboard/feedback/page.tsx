import PanelFeedback from "@/components/feedback/PanelFeedback";

export default function PaginaFeedback() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Feedback de Calidad</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.16 — carita en el cierre, alerta al dueño y resumen de turno.</p>
      <PanelFeedback />
    </div>
  );
}
