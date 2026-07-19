"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";

// ============================================================
// Hook de datos de la landing.
// Única fuente de datos para las secciones (BD vía API pública).
// ============================================================

export interface ProductoLanding {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  imagenUrl?: string | null;
  tiempoPreparacionMin?: number | null;
  nivelPicante?: number;
  calorias?: number | null;
  alergenos: string[];
  destacado?: boolean;
  tipo?: string;
}

export interface CategoriaLanding {
  id: string;
  nombre: string;
  descripcion?: string | null;
  productos: ProductoLanding[];
}

export interface MesaLanding {
  id: string;
  numero: string;
  capacidad: number;
  estado: string;
  sector: string;
}

export interface PromoLanding {
  id: string;
  nombre: string;
  descripcion?: string | null;
  tipo: string;
}

export interface ReseñaLanding {
  id: string;
  motivo?: string | null;
  cliente: string;
}

export interface LandingData {
  tenant: { nombre: string; slug: string };
  sucursal: { nombre: string; direccion?: string | null; telefono?: string | null; ciudad?: string | null } | null;
  carta: CategoriaLanding[];
  mesas: MesaLanding[];
  promociones: PromoLanding[];
  reseñas: ReseñaLanding[];
}

export function useLandingData() {
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    fetch(`/api/publico/landing?tenant=${SITE.tenantSlug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (activo) { setData(d); setLoading(false); } })
      .catch(() => { if (activo) { setError(true); setLoading(false); } });
    return () => { activo = false; };
  }, []);

  return { data, loading, error };
}
