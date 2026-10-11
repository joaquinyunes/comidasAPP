"use client";

import { useId, useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import Bloque from "../ui/Bloque";
import Boton from "../ui/Boton";
import Etiqueta from "../ui/Etiqueta";
import AvisoError from "../ui/AvisoError";
import CampoTexto from "../marketing/CampoTexto";
import BuscadorCliente, { type ClienteBusqueda } from "./BuscadorCliente";

interface MesaOpcion {
  id: string;
  numero: string;
  sector: { nombre: string } | null;
}

interface Reconocido {
  cliente?: { nombre: string; nivel: string; puntos: number; totalVisitas: number; alergias?: string[] } | null;
  sugerencias: { productoId: string; nombre: string; cantidad: number }[];
}

// Atender bien a quien ya conocemos: reconocerlo en su mesa, ver sus alergias
// y qué suele pedir, y sumarle la visita (puntos) al cobrar.
export default function EnLaMesa() {
  const idMesa = useId();
  const mesas = useDatos<MesaOpcion[]>("/api/mesas", 0);
  const [mesaId, setMesaId] = useState("");
  const [cliente, setCliente] = useState<ClienteBusqueda | null>(null);
  const [ficha, setFicha] = useState<Reconocido | null>(null);
  const [personas, setPersonas] = useState("");
  const [monto, setMonto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function llamar(url: string, cuerpo: unknown) {
    setOcupado(true);
    setAviso(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAviso({ tipo: "error", texto: json?.error ?? "No se pudo completar la acción." });
        return null;
      }
      return json;
    } catch {
      setAviso({ tipo: "error", texto: "Sin conexión." });
      return null;
    } finally {
      setOcupado(false);
    }
  }

  async function reconocer() {
    if (!mesaId || !cliente) return;
    const json = await llamar("/api/fidelizacion/reconocimiento", { mesaId, clienteId: cliente.id });
    if (json) {
      setFicha(json as Reconocido);
      setAviso({ tipo: "ok", texto: `${cliente.nombre} quedó vinculado a la mesa.` });
    }
  }

  async function registrarVisita() {
    if (!mesaId) return;
    const json = await llamar("/api/fidelizacion/visitas", {
      mesaId,
      clienteId: cliente?.id,
      personas: personas ? Number(personas) : undefined,
      monto: monto ? Number(monto.replace(",", ".")) : undefined,
    });
    if (json) {
      setAviso({
        tipo: "ok",
        texto: json.cliente ? `Visita registrada. ${json.cliente.nombre} suma puntos.` : "Visita registrada.",
      });
      setPersonas("");
      setMonto("");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Bloque titulo="Mesa y cliente">
        <div className="space-y-4">
          <div>
            <label htmlFor={idMesa} className="mb-1.5 block text-sm font-medium">
              Mesa
            </label>
            <select
              id={idMesa}
              value={mesaId}
              onChange={(e) => {
                setMesaId(e.target.value);
                setFicha(null);
              }}
              className="min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base"
            >
              <option value="">Elegí una mesa</option>
              {(mesas.datos ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  Mesa {m.numero}
                  {m.sector?.nombre ? ` · ${m.sector.nombre}` : ""}
                </option>
              ))}
            </select>
          </div>

          {cliente ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-pn-linea bg-pn-fondo px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate font-medium">{cliente.nombre}</p>
                <p className="pn-num text-xs text-pn-suave">
                  {cliente.nivel} · {cliente.puntos} puntos
                </p>
              </div>
              <Boton
                variante="texto"
                onClick={() => {
                  setCliente(null);
                  setFicha(null);
                }}
              >
                Cambiar
              </Boton>
            </div>
          ) : (
            <BuscadorCliente onElegir={setCliente} />
          )}

          <Boton variante="primario" tamano="grande" className="w-full" disabled={!mesaId || !cliente || ocupado} onClick={reconocer}>
            Reconocer en la mesa
          </Boton>

          <div className="border-t border-pn-linea pt-4">
            <p className="mb-3 text-sm font-medium">Sumar la visita</p>
            <div className="grid grid-cols-2 gap-3">
              <CampoTexto etiqueta="Personas" inputMode="numeric" value={personas} onChange={(e) => setPersonas(e.target.value.replace(/\D/g, ""))} />
              <CampoTexto etiqueta="Consumo ($)" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} />
            </div>
            <Boton className="mt-3 w-full" disabled={!mesaId || ocupado} onClick={registrarVisita}>
              Registrar visita
            </Boton>
          </div>

          {aviso &&
            (aviso.tipo === "error" ? (
              <AvisoError>{aviso.texto}</AvisoError>
            ) : (
              <p role="status" className="rounded-md bg-pn-ok-fondo px-3 py-2 text-sm text-pn-ok">
                {aviso.texto}
              </p>
            ))}
        </div>
      </Bloque>

      <Bloque titulo="Qué tener en cuenta" nota={ficha?.cliente?.nombre}>
        {!ficha ? (
          <p className="text-sm text-pn-suave">Elegí mesa y cliente y tocá “Reconocer” para ver alergias y qué suele pedir.</p>
        ) : (
          <div className="space-y-4">
            {(ficha.cliente?.alergias?.length ?? 0) > 0 && (
              <div className="rounded-lg border border-pn-peligro bg-pn-peligro-fondo p-3">
                <p className="text-sm font-semibold text-pn-peligro">Alergias</p>
                <p className="mt-1 flex flex-wrap gap-1.5">
                  {ficha.cliente?.alergias?.map((a) => (
                    <Etiqueta key={a} tono="peligro">
                      {a}
                    </Etiqueta>
                  ))}
                </p>
              </div>
            )}
            <p className="pn-num text-sm text-pn-suave">
              Nivel {ficha.cliente?.nivel} · {ficha.cliente?.puntos} puntos · {ficha.cliente?.totalVisitas} visitas
            </p>
            <div>
              <p className="mb-2 text-sm font-medium">Suele pedir</p>
              {ficha.sugerencias.length === 0 ? (
                <p className="text-sm text-pn-suave">Todavía no hay historial de pedidos.</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {ficha.sugerencias.map((s) => (
                    <li key={s.productoId} className="flex justify-between gap-3">
                      <span>{s.nombre}</span>
                      <span className="pn-num text-pn-suave">{s.cantidad} veces</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Bloque>
    </div>
  );
}
