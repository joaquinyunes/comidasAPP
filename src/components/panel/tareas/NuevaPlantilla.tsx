"use client";

import { useState } from "react";
import Hoja from "../ui/Hoja";
import Boton from "../ui/Boton";
import AvisoError from "../ui/AvisoError";
import GrupoOpciones from "../cobro/GrupoOpciones";
import CampoTexto from "../marketing/CampoTexto";

interface Props {
  onCerrar: () => void;
  onCreada: () => void;
}

export default function NuevaPlantilla({ onCerrar, onCreada }: Props) {
  const [tipo, setTipo] = useState("APERTURA");
  const [nombre, setNombre] = useState("");
  const [items, setItems] = useState<string[]>(["", ""]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utiles = items.map((i) => i.trim()).filter(Boolean);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || utiles.length === 0) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/personal/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          nombre: nombre.trim(),
          items: utiles.map((descripcion) => ({ descripcion })),
        }),
      });
      if (res.ok) {
        onCreada();
        return;
      }
      const json = await res.json().catch(() => ({}));
      setError(json?.error ?? "No se pudo crear la plantilla.");
    } catch {
      setError("Sin conexión.");
    }
    setEnviando(false);
  }

  return (
    <Hoja titulo="Nueva plantilla" subtitulo="La lista de cosas que hay que revisar" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="space-y-4">
        <GrupoOpciones
          leyenda="Cuándo se usa"
          opciones={[
            { valor: "APERTURA", etiqueta: "Al abrir" },
            { valor: "CIERRE", etiqueta: "Al cerrar" },
          ]}
          valor={tipo}
          onCambio={setTipo}
        />
        <CampoTexto etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} placeholder="Apertura de cocina" />

        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium">Qué hay que revisar</legend>
          {items.map((it, i) => (
            <input
              key={i}
              value={it}
              maxLength={200}
              aria-label={`Ítem ${i + 1}`}
              placeholder={`Ítem ${i + 1}`}
              onChange={(e) => setItems((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
              className="min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base"
            />
          ))}
          <Boton variante="texto" onClick={() => setItems((prev) => [...prev, ""])}>
            Agregar otro ítem
          </Boton>
        </fieldset>

        {error && <AvisoError>{error}</AvisoError>}

        <Boton type="submit" variante="primario" tamano="grande" className="w-full" disabled={!nombre.trim() || utiles.length === 0 || enviando}>
          {enviando ? "Guardando…" : "Crear plantilla"}
        </Boton>
      </form>
    </Hoja>
  );
}
