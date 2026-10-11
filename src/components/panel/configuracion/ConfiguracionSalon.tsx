"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import Bloque from "../ui/Bloque";
import Boton from "../ui/Boton";
import Hoja from "../ui/Hoja";
import AvisoError from "../ui/AvisoError";
import EstadoVacio from "../ui/EstadoVacio";
import CampoTexto from "../marketing/CampoTexto";
import { crearMesa } from "./acciones-configuracion";

interface SectorApi {
  id: string;
  nombre: string;
  mesas: { id: string; numero: string; capacidad: number }[];
}

function FormularioMesa({ sectores, onCerrar, onCreada }: { sectores: SectorApi[]; onCerrar: () => void; onCreada: () => void }) {
  const [numero, setNumero] = useState("");
  const [capacidad, setCapacidad] = useState("4");
  const [sectorId, setSectorId] = useState(sectores[0]?.id ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const r = await crearMesa({ numero: numero.trim(), capacidad: Math.max(1, Number(capacidad) || 1), sectorId });
    setEnviando(false);
    if (r.ok) onCreada();
    else setError(r.mensaje ?? "No se pudo crear la mesa.");
  }

  return (
    <Hoja titulo="Nueva mesa" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="space-y-4">
        <CampoTexto etiqueta="Número" value={numero} onChange={(e) => setNumero(e.target.value)} maxLength={10} autoFocus />
        <CampoTexto
          etiqueta="Lugares"
          inputMode="numeric"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value.replace(/\D/g, ""))}
        />
        <div>
          <label htmlFor="sector-mesa" className="mb-1.5 block text-sm font-medium">
            Sector
          </label>
          <select
            id="sector-mesa"
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value)}
            className="min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base"
          >
            {sectores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        {error && <AvisoError>{error}</AvisoError>}
        <Boton type="submit" variante="primario" tamano="grande" className="w-full" disabled={!numero.trim() || !sectorId || enviando}>
          {enviando ? "Creando…" : "Crear mesa"}
        </Boton>
      </form>
    </Hoja>
  );
}

// Sectores y mesas del salón. Cada mesa nueva ya tiene su QR en "QR de mesas".
export default function ConfiguracionSalon() {
  const { datos, cargando, error, recargar } = useDatos<SectorApi[]>("/api/sectores", 0);
  const [creando, setCreando] = useState(false);
  const sectores = datos ?? [];

  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (cargando && !datos) return <p className="text-sm text-pn-suave">Cargando el salón…</p>;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Boton variante="primario" disabled={sectores.length === 0} onClick={() => setCreando(true)}>
          Nueva mesa
        </Boton>
      </div>

      {sectores.length === 0 ? (
        <EstadoVacio titulo="No hay sectores cargados" detalle="Creá un sector para poder agregar mesas." />
      ) : (
        <div className="space-y-4">
          {sectores.map((s) => (
            <Bloque key={s.id} titulo={s.nombre} nota={`${s.mesas.length} ${s.mesas.length === 1 ? "mesa" : "mesas"}`}>
              {s.mesas.length === 0 ? (
                <p className="text-sm text-pn-suave">Sin mesas todavía.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {s.mesas.map((m) => (
                    <li key={m.id} className="rounded-md border border-pn-linea bg-pn-fondo px-3 py-1.5 text-sm">
                      <span className="pn-num font-semibold">{m.numero}</span>
                      <span className="ml-2 text-xs text-pn-suave">{m.capacidad} lugares</span>
                    </li>
                  ))}
                </ul>
              )}
            </Bloque>
          ))}
        </div>
      )}

      {creando && (
        <FormularioMesa
          sectores={sectores}
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
