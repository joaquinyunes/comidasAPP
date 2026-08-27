"use client";

import { useEffect, useState } from "react";

export interface Sesion {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
  permisos: string[];
}

// Datos del usuario logueado. Null mientras carga o si no hay sesión.
export function useSesion() {
  const [sesion, setSesion] = useState<Sesion | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (vivo) setSesion(json.data ?? null);
      })
      .catch(() => {
        if (vivo) setSesion(null);
      });
    return () => {
      vivo = false;
    };
  }, []);

  return sesion;
}

// ¿El usuario tiene este permiso? (soporta comodines "recurso:*" y "*")
export function tienePermiso(permisos: string[] | undefined, requerido: string): boolean {
  if (!permisos) return false;
  if (permisos.includes("*")) return true;
  if (permisos.includes(requerido)) return true;
  const [recurso] = requerido.split(":");
  return permisos.includes(`${recurso}:*`);
}
