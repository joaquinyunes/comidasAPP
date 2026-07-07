"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { TenantContext } from "@/types";

const TenantContext = createContext<TenantContext | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<TenantContext | null>(null);

  useEffect(() => {
    // TODO: Obtener del JWT/API
    setContext({
      tenantId: "demo-tenant",
      sucursalId: "demo-sucursal",
      usuarioId: "demo-user",
      roles: ["dueño"],
    });
  }, []);

  return (
    <TenantContext.Provider value={context}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant debe usarse dentro de TenantProvider");
  return ctx;
}
