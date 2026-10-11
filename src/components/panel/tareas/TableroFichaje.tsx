"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import { formatTime } from "@/lib/utils";
import {
  accionesDeFichaje,
  ETIQUETA_FICHAJE,
  resumirPlantel,
  TONO_FICHAJE,
  type TipoFichaje,
} from "@/lib/personal/fichaje";
import Bloque from "../ui/Bloque";
import Boton from "../ui/Boton";
import Etiqueta from "../ui/Etiqueta";
import Cifra from "../ui/Cifra";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";

interface Fichaje {
  empleadoId: string;
  nombre: string;
  cargo: string | null;
  estado: string;
  entrada: string | null;
  horasTrabajadas: number | null;
}

// Quién está, quién falta y un toque para fichar a cada uno.
export default function TableroFichaje() {
  const { datos, cargando, error, recargar } = useDatos<Fichaje[]>("/api/personal/fichaje", 30000);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [falla, setFalla] = useState<string | null>(null);

  async function fichar(empleadoId: string, tipo: TipoFichaje) {
    setOcupado(empleadoId);
    setFalla(null);
    try {
      const res = await fetch("/api/personal/fichaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empleadoId, tipo }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setFalla(json?.error ?? "No se pudo registrar el fichaje.");
      } else {
        await recargar();
      }
    } catch {
      setFalla("Sin conexión.");
    } finally {
      setOcupado(null);
    }
  }

  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (cargando && !datos) return <p className="text-sm text-pn-suave">Cargando el plantel…</p>;
  const plantel = datos ?? [];
  if (plantel.length === 0) {
    return <EstadoVacio titulo="No hay personal cargado" detalle="Se da de alta desde Configuración → Accesos." />;
  }

  const r = resumirPlantel(plantel.map((p) => p.estado));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Cifra etiqueta="Trabajando" valor={String(r.trabajando)} tono={r.trabajando > 0 ? "ok" : "neutro"} />
        <Cifra etiqueta="En descanso" valor={String(r.enDescanso)} />
        <Cifra etiqueta="Sin fichar" valor={String(r.faltan)} tono={r.faltan > 0 ? "aviso" : "neutro"} />
      </div>

      {falla && <AvisoError>{falla}</AvisoError>}

      <Bloque sinPadding>
        <ul className="divide-y divide-pn-linea">
          {plantel.map((p) => (
            <li key={p.empleadoId} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1 basis-44">
                <p className="font-medium">{p.nombre}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-pn-suave">
                  <Etiqueta tono={TONO_FICHAJE[p.estado] ?? "neutro"}>{ETIQUETA_FICHAJE[p.estado] ?? p.estado}</Etiqueta>
                  {p.cargo && <span>{p.cargo}</span>}
                  {p.entrada && <span className="pn-num">Entró {formatTime(p.entrada)}</span>}
                </p>
              </div>
              <div className="flex gap-2">
                {accionesDeFichaje(p.estado).map((a) => (
                  <Boton
                    key={a.tipo}
                    variante={a.principal ? "primario" : "secundario"}
                    disabled={ocupado === p.empleadoId}
                    onClick={() => fichar(p.empleadoId, a.tipo)}
                  >
                    {a.etiqueta}
                  </Boton>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Bloque>
    </div>
  );
}
