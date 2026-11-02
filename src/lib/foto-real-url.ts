// Convención: la foto realista de un producto vive en /assets/real/<nombre>.webp,
// con el mismo nombre base que su ilustración (pizza-muzzarella.svg → pizza-muzzarella.webp).
export function fotoRealUrl(imagenUrl: string | null | undefined): string | null {
  if (!imagenUrl) return null;
  const base = imagenUrl.split("?")[0].split("/").pop()?.replace(/\.[a-z0-9]+$/i, "");
  return base ? `/assets/real/${base}.webp` : null;
}
