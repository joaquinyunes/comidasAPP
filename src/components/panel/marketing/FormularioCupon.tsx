"use client";

import { useState } from "react";
import Hoja from "../ui/Hoja";
import Boton from "../ui/Boton";
import AvisoError from "../ui/AvisoError";
import GrupoOpciones from "../cobro/GrupoOpciones";
import CampoTexto from "./CampoTexto";
import { crearCupon } from "./acciones-marketing";

const hoy = () => new Date().toISOString().slice(0, 10);
const enDias = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

interface Props {
  onCerrar: () => void;
  onCreado: () => void;
}

export default function FormularioCupon({ onCerrar, onCreado }: Props) {
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<"porcentaje" | "monto_fijo">("porcentaje");
  const [valor, setValor] = useState("");
  const [desde, setDesde] = useState(hoy());
  const [hasta, setHasta] = useState(enDias(30));
  const [usos, setUsos] = useState("100");
  const [minimo, setMinimo] = useState("0");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valorNum = Number(valor.replace(",", "."));
  const completo = codigo.trim().length >= 3 && descripcion.trim() && valorNum > 0 && desde && hasta && hasta >= desde;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!completo) return;
    setEnviando(true);
    setError(null);
    const r = await crearCupon({
      codigo: codigo.trim().toUpperCase(),
      descripcion: descripcion.trim(),
      tipo,
      valor: valorNum,
      fechaInicio: desde,
      fechaFin: hasta,
      usosMaximos: Math.max(1, Math.floor(Number(usos) || 1)),
      minimoCompra: Math.max(0, Number(minimo.replace(",", ".")) || 0),
    });
    setEnviando(false);
    if (r.ok) onCreado();
    else setError(r.mensaje ?? "No se pudo crear el cupón.");
  }

  return (
    <Hoja titulo="Nuevo cupón" subtitulo="El cliente lo escribe al pedir" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="space-y-4">
        <CampoTexto
          etiqueta="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
          maxLength={20}
          placeholder="BIENVENIDA10"
          ayuda="Solo letras, números y guiones."
          autoFocus
        />
        <CampoTexto
          etiqueta="Qué es"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={200}
          placeholder="10% en tu primera compra"
        />

        <GrupoOpciones
          leyenda="Tipo de descuento"
          opciones={[
            { valor: "porcentaje", etiqueta: "Porcentaje" },
            { valor: "monto_fijo", etiqueta: "Monto fijo" },
          ]}
          valor={tipo}
          onCambio={(v) => setTipo(v as typeof tipo)}
        />
        <CampoTexto
          etiqueta={tipo === "porcentaje" ? "Porcentaje (%)" : "Monto a descontar ($)"}
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <CampoTexto etiqueta="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <CampoTexto etiqueta="Hasta" type="date" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto
            etiqueta="Veces que se puede usar"
            inputMode="numeric"
            value={usos}
            onChange={(e) => setUsos(e.target.value.replace(/\D/g, ""))}
          />
          <CampoTexto
            etiqueta="Compra mínima ($)"
            inputMode="decimal"
            value={minimo}
            onChange={(e) => setMinimo(e.target.value)}
          />
        </div>

        {error && <AvisoError>{error}</AvisoError>}

        <Boton type="submit" variante="primario" tamano="grande" className="w-full" disabled={!completo || enviando}>
          {enviando ? "Creando…" : "Crear cupón"}
        </Boton>
      </form>
    </Hoja>
  );
}
