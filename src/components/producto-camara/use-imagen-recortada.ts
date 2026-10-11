"use client";

import { useEffect, useState } from "react";
import { quitarFondo } from "./quitar-fondo";

// Devuelve la imagen del producto sin fondo claro. Mientras procesa (o si el
// recorte falla, ej. imagen sin CORS) devuelve la original, así el visor
// nunca queda sin imagen.
export function useImagenRecortada(src: string | null | undefined) {
  const [recortada, setRecortada] = useState<{ origen: string; url: string } | null>(null);

  useEffect(() => {
    if (!src) return;
    let vigente = true;
    quitarFondo(src)
      .then((url) => {
        if (vigente) setRecortada({ origen: src, url });
      })
      .catch(() => {
        // Se queda con la original.
      });
    return () => {
      vigente = false;
    };
  }, [src]);

  if (!src) return { url: null, recortada: false };
  if (recortada && recortada.origen === src) return { url: recortada.url, recortada: true };
  return { url: src, recortada: false };
}
