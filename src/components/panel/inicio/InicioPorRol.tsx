"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { INICIO_POR_ROL, rolPanel } from "@/lib/panel/rol-panel";
import { useSesionPanel } from "../shell/SesionContext";
import ResumenTurno from "./ResumenTurno";

// Cada persona aterriza en lo que usa en su turno:
// el jefe ve el resumen; mozo, cocina y caja van directo a su pantalla.
export default function InicioPorRol() {
  const sesion = useSesionPanel();
  const router = useRouter();
  const rol = sesion ? rolPanel({ roles: sesion.roles, permisos: sesion.permisos }) : null;

  useEffect(() => {
    if (rol && rol !== "jefe") router.replace(INICIO_POR_ROL[rol]);
  }, [rol, router]);

  if (!rol || rol !== "jefe") {
    return <p className="text-sm text-pn-suave">Abriendo tu pantalla…</p>;
  }
  return <ResumenTurno />;
}
