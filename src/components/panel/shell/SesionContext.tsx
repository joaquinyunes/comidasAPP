"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSesion, type Sesion } from "@/components/dashboard/useSesion";

// La sesión se consulta una sola vez para todo el panel.
// null = todavía cargando (o sin sesión).
const Contexto = createContext<Sesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const sesion = useSesion();
  return <Contexto.Provider value={sesion}>{children}</Contexto.Provider>;
}

export function useSesionPanel(): Sesion | null {
  return useContext(Contexto);
}
