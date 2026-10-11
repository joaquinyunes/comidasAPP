"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import { cn } from "@/lib/utils";
import Hoja from "../ui/Hoja";
import Boton from "../ui/Boton";
import AvisoError from "../ui/AvisoError";

interface ItemApi {
  id: string;
  descripcion: string;
  obligatorio: boolean;
}

interface PlantillaApi {
  id: string;
  nombre: string;
  tipo: string;
  items: ItemApi[];
}

interface Props {
  plantillaId: string;
  nombre: string;
  onCerrar: () => void;
  onListo: (completo: boolean) => void;
}

// Se tilda lo que de verdad se hizo; lo obligatorio sin tildar deja el
// checklist "incompleto" y queda registrado así.
export default function HacerChecklist({ plantillaId, nombre, onCerrar, onListo }: Props) {
  const { datos, cargando, error, recargar } = useDatos<PlantillaApi>(`/api/personal/checklists/${plantillaId}`, 0);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [enviando, setEnviando] = useState(false);
  const [falla, setFalla] = useState<string | null>(null);

  function alternar(id: string) {
    setMarcados((prev) => {
      const sig = new Set(prev);
      if (sig.has(id)) sig.delete(id);
      else sig.add(id);
      return sig;
    });
  }

  const items = datos?.items ?? [];
  const faltanObligatorios = items.filter((i) => i.obligatorio && !marcados.has(i.id)).length;

  async function enviar() {
    setEnviando(true);
    setFalla(null);
    try {
      const res = await fetch(`/api/personal/checklists/${plantillaId}/ejecutar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ itemId: i.id, marcado: marcados.has(i.id) })) }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) onListo(Boolean(json.completo));
      else setFalla(json?.error ?? "No se pudo guardar el checklist.");
    } catch {
      setFalla("Sin conexión.");
    }
    setEnviando(false);
  }

  const pie = (
    <div>
      {falla && (
        <div className="mb-2">
          <AvisoError>{falla}</AvisoError>
        </div>
      )}
      {faltanObligatorios > 0 && (
        <p className="mb-2 text-sm text-pn-aviso">
          Falta{faltanObligatorios === 1 ? "" : "n"} {faltanObligatorios} ítem{faltanObligatorios === 1 ? "" : "s"} obligatorio
          {faltanObligatorios === 1 ? "" : "s"}. Se guarda como incompleto.
        </p>
      )}
      <Boton variante="primario" tamano="grande" className="w-full" disabled={enviando || items.length === 0} onClick={enviar}>
        {enviando ? "Guardando…" : "Guardar checklist"}
      </Boton>
    </div>
  );

  return (
    <Hoja titulo={nombre} subtitulo={datos ? `${marcados.size} de ${items.length} hechos` : undefined} onCerrar={onCerrar} pie={pie}>
      {cargando && <p className="text-sm text-pn-suave">Cargando…</p>}
      {error && !datos && <AvisoError onReintentar={recargar}>{error}</AvisoError>}
      <ul className="space-y-2">
        {items.map((i) => {
          const hecho = marcados.has(i.id);
          return (
            <li key={i.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={hecho}
                onClick={() => alternar(i.id)}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-lg border px-3 text-left",
                  hecho ? "border-pn-ok bg-pn-ok-fondo" : "border-pn-linea bg-pn-papel hover:bg-pn-hundido"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded border-2 text-sm font-bold",
                    hecho ? "border-pn-ok bg-pn-ok text-white" : "border-pn-linea-fuerte"
                  )}
                >
                  {hecho ? "✓" : ""}
                </span>
                <span className="flex-1 text-[15px]">{i.descripcion}</span>
                {i.obligatorio && <span className="text-xs text-pn-suave">Obligatorio</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </Hoja>
  );
}
