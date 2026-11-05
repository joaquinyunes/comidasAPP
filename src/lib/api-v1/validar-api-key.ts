// ============================================================
// API key de la API pública /api/v1.
// Las claves viven en la variable de entorno API_V1_KEYS (JSON), nunca en el código:
//   {"<clave larga y al azar>":{"tenantId":"<uuid>","scopes":["productos:leer"]}}
// Sin la variable no hay claves válidas y todo /api/v1 responde 401.
// La clave solo se acepta por cabecera X-API-Key (en la URL quedaría en los logs).
// shortcut: claves en una variable de entorno; con más de un cliente de la API pasarlas a una tabla con hash.
// ============================================================

import type { NextRequest } from "next/server";
import { z } from "zod";

export interface SesionApiKey {
  tenantId: string;
  scopes: string[];
}

const Claves = z.record(z.string().min(24), z.object({ tenantId: z.string().uuid(), scopes: z.array(z.string()) }));

function leerClaves(): Record<string, SesionApiKey> {
  const crudo = process.env.API_V1_KEYS;
  if (!crudo) return {};
  try {
    const r = Claves.safeParse(JSON.parse(crudo));
    return r.success ? r.data : {};
  } catch {
    return {};
  }
}

export async function validarAPIKey(request: NextRequest): Promise<SesionApiKey | null> {
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey) return null;
  const claves = leerClaves();
  return Object.hasOwn(claves, apiKey) ? claves[apiKey] : null;
}
