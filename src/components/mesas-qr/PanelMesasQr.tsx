"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { urlClienteMesa } from "@/lib/mesas/url-cliente";
import { urlPedirLocal } from "@/lib/mesas/url-local";
import EncabezadoPagina from "@/components/panel/ui/EncabezadoPagina";
import EstadoVacio from "@/components/panel/ui/EstadoVacio";
import AvisoError from "@/components/panel/ui/AvisoError";
import Boton from "@/components/panel/ui/Boton";
import { useMesas } from "./useMesas";
import QrMesa from "./QrMesa";
import QrLocal from "./QrLocal";

const QR_LOCAL_CODIGO = process.env.NEXT_PUBLIC_QR_LOCAL_CODIGO ?? "";

export default function PanelMesasQr() {
  const { mesas, cargando, error } = useMesas();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // El origin real solo se conoce en el cliente (evita mismatch de hidratación).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="print:hidden">
        <EncabezadoPagina
          titulo="QR de mesas"
          descripcion="Imprimí uno por mesa. El cliente lo escanea y pide desde el celular, sin descargar nada."
          acciones={
            <Boton variante="primario" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden />
              Imprimir todos
            </Boton>
          }
        />
      </div>

      {error && <AvisoError>{error}</AvisoError>}

      {origin && QR_LOCAL_CODIGO && (
        <div className="mb-6 max-w-xs">
          <QrLocal url={urlPedirLocal(origin, QR_LOCAL_CODIGO)} />
        </div>
      )}

      {cargando && <p className="text-sm text-pn-suave">Cargando mesas…</p>}
      {!cargando && !error && mesas.length === 0 && (
        <EstadoVacio titulo="No hay mesas cargadas" detalle="Cargalas desde Configuración para generar sus QR." />
      )}

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
        {origin &&
          mesas.map((m) => <QrMesa key={m.id} numero={m.numero} url={urlClienteMesa(origin, m.id)} />)}
      </div>
    </div>
  );
}
