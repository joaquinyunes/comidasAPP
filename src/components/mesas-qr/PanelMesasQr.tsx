"use client";

import { useEffect, useState } from "react";
import { urlClienteMesa } from "@/lib/mesas/url-cliente";
import { urlPedirLocal } from "@/lib/mesas/url-local";
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
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">QR de mesas</h1>
          <p className="text-sm text-zinc-500">
            Imprimí y pegá un QR en cada mesa. El cliente escanea y pide desde el celular.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          Imprimir todos
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {origin && QR_LOCAL_CODIGO && (
        <div className="mb-6 max-w-xs">
          <QrLocal url={urlPedirLocal(origin, QR_LOCAL_CODIGO)} />
        </div>
      )}

      {cargando && <p className="text-sm text-zinc-500">Cargando mesas…</p>}
      {!cargando && !error && mesas.length === 0 && (
        <p className="text-sm text-zinc-500">No hay mesas cargadas.</p>
      )}

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
        {origin &&
          mesas.map((m) => (
            <QrMesa key={m.id} numero={m.numero} url={urlClienteMesa(origin, m.id)} />
          ))}
      </div>
    </div>
  );
}
