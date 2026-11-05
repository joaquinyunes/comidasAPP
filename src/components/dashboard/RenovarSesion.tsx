"use client";

import { useEffect } from "react";

// Si una llamada a /api/* vuelve con 401 (el acceso dura 15 min), pide un acceso nuevo
// con el refresco y repite la llamada una vez. Si no se puede renovar, va al login.
// Cubre todos los fetch del panel sin tocar cada uno.
export default function RenovarSesion() {
  useEffect(() => {
    const original = window.fetch;
    let renovando: Promise<boolean> | null = null;

    const renovar = () => {
      renovando ??= original("/api/auth/refresh", { method: "POST" })
        .then((r) => r.ok)
        .catch(() => false)
        .finally(() => {
          renovando = null;
        });
      return renovando;
    };

    window.fetch = async (input, init) => {
      const res = await original(input, init);
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const esApiPropia = url.startsWith("/api/") || url.startsWith(window.location.origin + "/api/");
      if (res.status !== 401 || !esApiPropia || url.includes("/api/auth/")) return res;

      if (await renovar()) return original(input, init);
      window.location.replace("/login");
      return res;
    };

    return () => {
      window.fetch = original;
    };
  }, []);

  return null;
}
