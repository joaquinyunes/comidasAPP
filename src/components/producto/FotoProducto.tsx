"use client";

import { useState } from "react";
import { fotoRealUrl } from "@/lib/foto-real-url";

// Foto del producto: la realista de /assets/real si existe; si no (404) cae a
// la imagen que trae el producto (ilustración). El tamaño lo pone el CSS.
export default function FotoProducto({
  imagenUrl,
  alt,
  className,
  real = true,
}: {
  imagenUrl?: string | null;
  alt: string;
  className?: string;
  // false = no intentar la foto realista (p. ej. datos de respaldo sin foto).
  real?: boolean;
}) {
  const [fallo, setFallo] = useState(false);
  const foto = real ? fotoRealUrl(imagenUrl) : null;
  const src = foto && !fallo ? foto : imagenUrl;
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- fallback propio por onError; el optimizador no aporta en webp de 640px
    <img src={src} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setFallo(true)} />
  );
}
