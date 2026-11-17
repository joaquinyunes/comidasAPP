import PanelMesasQr from "@/components/mesas-qr/PanelMesasQr";
import { codigoLocalEsperado } from "@/lib/qr-local";

// Página de servidor: el código del QR llega al navegador solo de quien tiene sesión y permiso de mesas.
export default function MesasPage() {
  return <PanelMesasQr codigoQr={codigoLocalEsperado()} />;
}
