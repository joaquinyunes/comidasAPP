"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import Bloque from "../ui/Bloque";
import Boton from "../ui/Boton";
import AvisoError from "../ui/AvisoError";
import CampoTexto from "../marketing/CampoTexto";
import { guardarLocal } from "./acciones-configuracion";

interface LocalApi {
  nombre: string;
  slug: string;
  plan: string;
  sucursal: { id: string; nombre: string; direccion: string | null; telefono: string | null; email: string | null } | null;
}

function Editor({ inicial, onGuardado }: { inicial: LocalApi; onGuardado: () => void }) {
  const [nombre, setNombre] = useState(inicial.nombre);
  const [sucNombre, setSucNombre] = useState(inicial.sucursal?.nombre ?? "");
  const [direccion, setDireccion] = useState(inicial.sucursal?.direccion ?? "");
  const [telefono, setTelefono] = useState(inicial.sucursal?.telefono ?? "");
  const [email, setEmail] = useState(inicial.sucursal?.email ?? "");
  const [estado, setEstado] = useState<"idle" | "guardando" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("guardando");
    setError(null);
    const r = await guardarLocal({
      nombre: nombre.trim(),
      sucursal: { nombre: sucNombre.trim(), direccion: direccion.trim(), telefono: telefono.trim(), email: email.trim() },
    });
    if (r.ok) {
      setEstado("ok");
      onGuardado();
    } else {
      setEstado("idle");
      setError(r.mensaje ?? "No se pudo guardar.");
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      <Bloque titulo="El negocio">
        <CampoTexto etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={255} required />
      </Bloque>

      <Bloque titulo="Local principal" nota="Es lo que ve el cliente en el sitio y en los comprobantes">
        <div className="space-y-4">
          <CampoTexto
            etiqueta="Nombre del local"
            value={sucNombre}
            onChange={(e) => setSucNombre(e.target.value)}
            maxLength={255}
            required
          />
          <CampoTexto etiqueta="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength={300} />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto etiqueta="Teléfono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength={50} />
            <CampoTexto etiqueta="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </div>
        </div>
      </Bloque>

      {error && <AvisoError>{error}</AvisoError>}
      {estado === "ok" && (
        <p role="status" className="rounded-md bg-pn-ok-fondo px-3 py-2 text-sm text-pn-ok">
          Guardado.
        </p>
      )}

      <Boton type="submit" variante="primario" tamano="grande" disabled={estado === "guardando" || !nombre.trim() || !sucNombre.trim()}>
        {estado === "guardando" ? "Guardando…" : "Guardar cambios"}
      </Boton>
    </form>
  );
}

export default function FormularioLocal() {
  const { datos, cargando, error, recargar } = useDatos<LocalApi>("/api/configuracion", 0);

  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (cargando || !datos) return <p className="text-sm text-pn-suave">Cargando…</p>;
  return <Editor inicial={datos} onGuardado={recargar} />;
}
