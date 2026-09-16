"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  url: string;
}

// QR único para pedidos "en el local" sin mesa individual: se
// imprime una sola vez y se pega en la entrada o el mostrador.
export default function QrLocal({ url }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vivo = true;
    QRCode.toDataURL(url, { width: 320, margin: 1 })
      .then((d) => {
        if (vivo) setDataUrl(d);
      })
      .catch(() => {
        if (vivo) setError(true);
      });
    return () => {
      vivo = false;
    };
  }, [url]);

  return (
    <figure className="qr-mesa flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 p-4 text-center">
      <span className="text-lg font-bold">Pedir en el local</span>
      <p className="text-xs text-zinc-500">Para salón sin QR por mesa: el cliente escanea y escribe su mesa o mozo.</p>
      {error && <span className="text-xs text-red-600">No se pudo generar el QR</span>}
      {dataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="QR para pedir en el local" width={200} height={200} />
      )}
      <figcaption className="break-all text-[10px] text-zinc-400">{url}</figcaption>
    </figure>
  );
}
