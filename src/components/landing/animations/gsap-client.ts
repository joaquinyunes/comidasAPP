"use client";

// Registro único de GSAP + plugins para todo el landing. Un solo lugar de
// entrada evita registrar el plugin más de una vez y aísla el import
// client-only (GSAP no debe correr en SSR).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Decisión de producto: la landing siempre se muestra con todos sus efectos,
// aunque el sistema pida "reducir movimiento" (muchos celulares lo traen
// activo por ahorro de batería y dejaban la página plana y sin 3D). Se
// mantiene la función como único punto de control por si se revierte.
export function prefersReducedMotion(): boolean {
  return false;
}

export { gsap, ScrollTrigger, useGSAP };
