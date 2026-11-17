// Orígenes desde los que next/image acepta fotos (antes: "**", cualquier https del mundo, lo que
// convertía a /_next/image en un proxy abierto). Se configura con IMAGENES_HOSTS (variable de build),
// lista separada por comas: "fotos.mirestaurante.com, *.supabase.co". Vacía = solo imágenes propias
// (/assets/...). Una foto externa no listada se ve rota, a propósito.

export interface PatronImagen {
  protocol: "https";
  hostname: string;
}

export function patronesImagenes(lista: string | undefined): PatronImagen[] {
  return (lista ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter((h) => /^(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(h)) // dominios válidos; "**" y comodines sueltos no pasan
    .map((hostname) => ({ protocol: "https" as const, hostname }));
}
