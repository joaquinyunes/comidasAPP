import PanelAutoCliente from "@/components/cliente/PanelAutoCliente";

export default async function PaginaClienteMesa({ params }: { params: Promise<{ mesaId: string }> }) {
  const { mesaId } = await params;
  return <PanelAutoCliente mesaId={mesaId} />;
}
