"use client";

import { useDatos } from "@/hooks/use-datos";
import Bloque from "../ui/Bloque";
import Etiqueta from "../ui/Etiqueta";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import type { EmpleadoApi } from "./tipos";

export default function ListaPersonal() {
  const { datos, cargando, error, recargar } = useDatos<EmpleadoApi[]>("/api/rrhh/empleados?limit=100", 0);
  const personal = datos ?? [];

  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (cargando && !datos) return <p className="text-sm text-pn-suave">Cargando el equipo…</p>;
  if (personal.length === 0) {
    return <EstadoVacio titulo="Todavía no hay personal cargado" detalle="Se da de alta desde Configuración → Accesos." />;
  }

  return (
    <Bloque sinPadding>
      <ul className="divide-y divide-pn-linea">
        {personal.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pn-hundido text-sm font-semibold" aria-hidden>
              {p.usuario.nombre.trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 basis-44">
              <p className="font-medium">{p.usuario.nombre}</p>
              <p className="truncate text-sm text-pn-suave">
                {p.cargo ?? "Sin cargo"} · {p.usuario.email}
              </p>
            </div>
            <Etiqueta tono={p.estado === "activo" ? "ok" : "neutro"}>{p.estado === "activo" ? "Activo" : p.estado}</Etiqueta>
          </li>
        ))}
      </ul>
    </Bloque>
  );
}
