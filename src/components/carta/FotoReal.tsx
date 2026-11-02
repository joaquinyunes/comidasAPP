"use client";

import { fotoRealUrl } from "@/lib/foto-real-url";
import { useFotoRevelada } from "./use-foto-revelada";

// Capa de foto realista que cubre la escena de la tarjeta una vez terminada
// la animación de la ilustración. Marca la escena con `data-real` al revelarse.
export default function FotoReal({ imagenUrl, alt }: { imagenUrl?: string | null; alt: string }) {
  const src = fotoRealUrl(imagenUrl);
  const { ref, cargar, revelada, onLoad, onError } = useFotoRevelada();
  if (!src) return null;

  return (
    <div ref={ref} className="carta-foto-real" data-real={revelada ? "1" : undefined} aria-hidden={!revelada}>
      {cargar ? (
        // eslint-disable-next-line @next/next/no-img-element -- si falta el archivo se cae a la ilustración, sin pasar por el optimizador
        <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={onLoad} onError={onError} />
      ) : null}
    </div>
  );
}
