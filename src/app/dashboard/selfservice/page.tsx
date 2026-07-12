import PanelSelfService from "@/components/selfservice/PanelSelfService";

export default function PaginaSelfService() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Configuración Self-service</h1>
      <p className="mb-6 text-sm text-zinc-500">Micro-fase 2.20 — constructor de menú, roles/permisos, promociones y checklist inicial del dueño.</p>
      <PanelSelfService />
    </div>
  );
}
