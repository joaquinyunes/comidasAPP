// El seed de demo crea usuarios con mails conocidos (admin@cozizina.com…) y una clave común.
// En producción solo puede correr con SEED_PASSWORD fuerte; y el valor de desarrollo ("admin123")
// nunca se usa fuera de local.

export function claveDelSeed(env: { NODE_ENV?: string; SEED_PASSWORD?: string }): string {
  const clave = env.SEED_PASSWORD ?? "";
  if (env.NODE_ENV === "production") {
    if (clave.length < 12) {
      throw new Error("El seed no corre en producción sin SEED_PASSWORD de al menos 12 caracteres (cargaría usuarios demo con clave débil).");
    }
    return clave;
  }
  return clave || "admin123"; // solo desarrollo local
}
