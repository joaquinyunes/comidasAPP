"use client";

export interface Resultado {
  ok: boolean;
  mensaje?: string;
}

async function leerError(res: Response, porDefecto: string): Promise<string> {
  const json = await res.json().catch(() => ({}));
  // El backend manda los motivos como "campo: mensaje"; mostramos el mensaje.
  const primero = Array.isArray(json?.details) ? json.details[0] : undefined;
  const detalle = typeof primero === "string" ? primero.split(": ").slice(1).join(": ") || primero : undefined;
  return detalle ?? json?.error ?? porDefecto;
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

export interface NuevoCupon {
  codigo: string;
  descripcion: string;
  tipo: "porcentaje" | "monto_fijo";
  valor: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;
  usosMaximos: number;
  minimoCompra: number;
}

export const crearCupon = (c: NuevoCupon) =>
  enviar("/api/marketing/cupones", "POST", { ...c, usosPorCliente: 1, activo: true }, "No se pudo crear el cupón.");

export const cambiarEstadoCupon = (id: string, activo: boolean) =>
  enviar(`/api/marketing/cupones/${id}`, "PATCH", { activo }, "No se pudo cambiar el cupón.");

export interface NuevaCampana {
  nombre: string;
  descripcion?: string;
  tipo: "email" | "sms" | "push" | "whatsapp" | "redes_sociales";
  fechaInicio: string;
  fechaFin?: string;
}

export const crearCampana = (c: NuevaCampana) =>
  enviar("/api/marketing/campanas", "POST", { ...c, estado: "borrador" }, "No se pudo crear la campaña.");
