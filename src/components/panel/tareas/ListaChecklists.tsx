"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import Bloque from "../ui/Bloque";
import Boton from "../ui/Boton";
import Etiqueta from "../ui/Etiqueta";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import HacerChecklist from "./HacerChecklist";
import NuevaPlantilla from "./NuevaPlantilla";

interface Plantilla {
  id: string;
  nombre: string;
  tipo: string;
  _count: { items: number; ejecuciones: number };
}

export default function ListaChecklists() {
  const { datos, cargando, error, recargar } = useDatos<Plantilla[]>("/api/personal/checklists", 0);
  const [haciendo, setHaciendo] = useState<Plantilla | null>(null);
  const [creando, setCreando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const plantillas = datos ?? [];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Boton onClick={() => setCreando(true)}>Nueva plantilla</Boton>
      </div>

      {resultado && (
        <p role="status" className="mb-3 rounded-md bg-pn-ok-fondo px-3 py-2 text-sm text-pn-ok">
          {resultado}
        </p>
      )}
      {error && !datos && <AvisoError onReintentar={recargar}>{error}</AvisoError>}
      {cargando && !datos && <p className="text-sm text-pn-suave">Cargando checklists…</p>}
      {datos && plantillas.length === 0 && (
        <EstadoVacio titulo="Todavía no hay checklists" detalle="Armá uno para la apertura y otro para el cierre." />
      )}

      {plantillas.length > 0 && (
        <Bloque sinPadding>
          <ul className="divide-y divide-pn-linea">
            {plantillas.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-0 flex-1 basis-44">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{p.nombre}</span>
                    <Etiqueta tono={p.tipo === "APERTURA" ? "info" : "neutro"}>
                      {p.tipo === "APERTURA" ? "Apertura" : "Cierre"}
                    </Etiqueta>
                  </p>
                  <p className="pn-num text-xs text-pn-suave">
                    {p._count.items} ítems · se hizo {p._count.ejecuciones} {p._count.ejecuciones === 1 ? "vez" : "veces"}
                  </p>
                </div>
                <Boton variante="primario" onClick={() => setHaciendo(p)}>
                  Hacer ahora
                </Boton>
              </li>
            ))}
          </ul>
        </Bloque>
      )}

      {haciendo && (
        <HacerChecklist
          plantillaId={haciendo.id}
          nombre={haciendo.nombre}
          onCerrar={() => setHaciendo(null)}
          onListo={(completo) => {
            setHaciendo(null);
            setResultado(completo ? "Checklist completo. Quedó registrado." : "Checklist guardado como incompleto: faltaron ítems obligatorios.");
            void recargar();
          }}
        />
      )}
      {creando && (
        <NuevaPlantilla
          onCerrar={() => setCreando(false)}
          onCreada={() => {
            setCreando(false);
            void recargar();
          }}
        />
      )}
    </>
  );
}
