"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  numero: string;
  url: string;
}

// Genera el QR como data URL una sola vez por URL.
export default function QrMesa({ numero, url }: Props) {
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
      <span className="text-lg font-bold">Mesa {numero}</span>
      {error && <span className="text-xs text-red-600">No se pudo generar el QR</span>}
      {dataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt={`QR mesa ${numero}`} width={200} height={200} />
      )}
      <figcaption className="break-all text-[10px] text-zinc-400">{url}</figcaption>
    </figure>
  );
}
