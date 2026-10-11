"use client";

export interface Resultado {
  ok: boolean;
  mensaje?: string;
}

async function leerError(res: Response, porDefecto: string): Promise<string> {
  const json = await res.json().catch(() => ({}));
  const primero = Array.isArray(json?.details) ? json.details[0] : undefined;
  const detalle = typeof primero === "string" ? primero.split(": ").slice(1).join(": ") || primero : undefined;
  return json?.error && json.error !== "Datos inválidos" ? json.error : (detalle ?? json?.error ?? porDefecto);
}

async function enviar(url: string, metodo: string, cuerpo: unknown, porDefecto: string): Promise<Resultado> {
  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    if (res.ok) return { ok: true };
    return { ok: false, mensaje: await leerError(res, porDefecto) };
  } catch {
    return { ok: false, mensaje: "Sin conexión." };
  }
}

export interface DatosLocal {
  nombre: string;
  sucursal: { nombre: string; direccion: string | null; telefono: string | null; email: string | null };
}

export const guardarLocal = (d: DatosLocal) =>
  enviar(
    "/api/configuracion",
    "PUT",
    {
      nombre: d.nombre,
      sucursal: {
        nombre: d.sucursal.nombre,
        direccion: d.sucursal.direccion || null,
        telefono: d.sucursal.telefono || null,
        email: d.sucursal.email || null,
      },
    },
    "No se pudieron guardar los datos."
  );

export const crearAcceso = (a: { nombre: string; email: string; password: string; rolId: string }) =>
  enviar("/api/configuracion/accesos", "POST", a, "No se pudo dar de alta a la persona.");

export const cambiarAcceso = (id: string, activo: boolean) =>
  enviar(`/api/configuracion/accesos/${id}`, "PATCH", { activo }, "No se pudo cambiar el acceso.");

export const crearMesa = (m: { numero: string; capacidad: number; sectorId: string }) =>
  enviar("/api/mesas", "POST", m, "No se pudo crear la mesa.");
