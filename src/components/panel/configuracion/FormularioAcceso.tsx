"use client";

import { useId, useState } from "react";
import Hoja from "../ui/Hoja";
import Boton from "../ui/Boton";
import AvisoError from "../ui/AvisoError";
import CampoTexto from "../marketing/CampoTexto";
import { crearAcceso } from "./acciones-configuracion";

interface Props {
  roles: { id: string; nombre: string }[];
  onCerrar: () => void;
  onCreado: () => void;
}

export default function FormularioAcceso({ roles, onCerrar, onCreado }: Props) {
  const idRol = useId();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState(roles[0]?.id ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completo = nombre.trim() && email.includes("@") && password.length >= 8 && rolId;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!completo) return;
    setEnviando(true);
    setError(null);
    const r = await crearAcceso({ nombre: nombre.trim(), email: email.trim(), password, rolId });
    setEnviando(false);
    if (r.ok) onCreado();
    else setError(r.mensaje ?? "No se pudo dar de alta.");
  }

  return (
    <Hoja titulo="Dar de alta a una persona" subtitulo="Va a entrar con su email y esta contraseña" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="space-y-4">
        <CampoTexto etiqueta="Nombre y apellido" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} autoFocus />
        <CampoTexto etiqueta="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />

        <div>
          <label htmlFor={idRol} className="mb-1.5 block text-sm font-medium">
            Qué hace
          </label>
          <select
            id={idRol}
            value={rolId}
            onChange={(e) => setRolId(e.target.value)}
            className="min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-pn-suave">El rol decide qué pantallas ve y qué puede tocar.</p>
        </div>

        <CampoTexto
          etiqueta="Contraseña inicial"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          ayuda="Mínimo 8 caracteres. Pedile que la cambie en Mi cuenta."
        />

        {error && <AvisoError>{error}</AvisoError>}

        <Boton type="submit" variante="primario" tamano="grande" className="w-full" disabled={!completo || enviando}>
          {enviando ? "Creando…" : "Dar de alta"}
        </Boton>
      </form>
    </Hoja>
  );
}
