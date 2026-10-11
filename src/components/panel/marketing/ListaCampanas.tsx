"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import Bloque from "../ui/Bloque";
import Boton from "../ui/Boton";
import Etiqueta from "../ui/Etiqueta";
import EstadoVacio from "../ui/EstadoVacio";
import AvisoError from "../ui/AvisoError";
import Hoja from "../ui/Hoja";
import GrupoOpciones from "../cobro/GrupoOpciones";
import CampoTexto from "./CampoTexto";
import { crearCampana, type NuevaCampana } from "./acciones-marketing";
import type { Tono } from "../tonos";

interface CampanaApi {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string | null;
}

const ESTADO: Record<string, { texto: string; tono: Tono }> = {
  borrador: { texto: "Borrador", tono: "neutro" },
  programada: { texto: "Programada", tono: "info" },
  enviando: { texto: "Enviando", tono: "aviso" },
  enviada: { texto: "Enviada", tono: "ok" },
  pausada: { texto: "Pausada", tono: "aviso" },
  cancelada: { texto: "Cancelada", tono: "peligro" },
};

const CANAL: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  push: "Notificación",
  whatsapp: "WhatsApp",
  redes_sociales: "Redes sociales",
};

const CANALES = Object.entries(CANAL).map(([valor, etiqueta]) => ({ valor, etiqueta }));

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });
}

function FormularioCampana({ onCerrar, onCreada }: { onCerrar: () => void; onCreada: () => void }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<NuevaCampana["tipo"]>("whatsapp");
  const [desde, setDesde] = useState(new Date().toISOString().slice(0, 10));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setEnviando(true);
    setError(null);
    const r = await crearCampana({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      tipo,
      fechaInicio: desde,
    });
    setEnviando(false);
    if (r.ok) onCreada();
    else setError(r.mensaje ?? "No se pudo crear la campaña.");
  }

  return (
    <Hoja titulo="Nueva campaña" subtitulo="Queda como borrador hasta que la programes" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="space-y-4">
        <CampoTexto etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} autoFocus />
        <CampoTexto
          etiqueta="De qué se trata"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={500}
          placeholder="Pizza 2x1 los jueves"
        />
        <GrupoOpciones
          leyenda="Por dónde sale"
          opciones={CANALES}
          valor={tipo}
          onCambio={(v) => setTipo(v as NuevaCampana["tipo"])}
        />
        <CampoTexto etiqueta="Empieza" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        {error && <AvisoError>{error}</AvisoError>}
        <Boton type="submit" variante="primario" tamano="grande" className="w-full" disabled={!nombre.trim() || enviando}>
          {enviando ? "Creando…" : "Crear campaña"}
        </Boton>
      </form>
    </Hoja>
  );
}

export default function ListaCampanas() {
  const { datos, cargando, error, recargar } = useDatos<CampanaApi[]>("/api/marketing/campanas?limit=100", 0);
  const [creando, setCreando] = useState(false);
  const campanas = datos ?? [];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Boton variante="primario" onClick={() => setCreando(true)}>
          Nueva campaña
        </Boton>
      </div>

      {error && !datos && <AvisoError onReintentar={recargar}>{error}</AvisoError>}
      {cargando && !datos && <p className="text-sm text-pn-suave">Cargando campañas…</p>}
      {datos && campanas.length === 0 && (
        <EstadoVacio titulo="Todavía no hay campañas" detalle="Una campaña agrupa una promo con su canal y sus fechas." />
      )}

      {campanas.length > 0 && (
        <Bloque sinPadding>
          <ul className="divide-y divide-pn-linea">
            {campanas.map((c) => {
              const e = ESTADO[c.estado] ?? { texto: c.estado, tono: "neutro" as Tono };
              return (
                <li key={c.id} className="px-4 py-3">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{c.nombre}</span>
                    <Etiqueta tono={e.tono}>{e.texto}</Etiqueta>
                  </p>
                  {c.descripcion && <p className="mt-0.5 text-sm text-pn-suave">{c.descripcion}</p>}
                  <p className="pn-num mt-1 text-xs text-pn-suave">
                    {CANAL[c.tipo] ?? c.tipo} · desde el {fecha(c.fechaInicio)}
                    {c.fechaFin ? ` hasta el ${fecha(c.fechaFin)}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        </Bloque>
      )}

      {creando && (
        <FormularioCampana
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
