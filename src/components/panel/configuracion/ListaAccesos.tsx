"use client";

import { useState } from "react";
import { useDatos } from "@/hooks/use-datos";
import Bloque from "../ui/Bloque";
import Boton from "../ui/Boton";
import Etiqueta from "../ui/Etiqueta";
import AvisoError from "../ui/AvisoError";
import FormularioAcceso from "./FormularioAcceso";
import { cambiarAcceso } from "./acciones-configuracion";

interface AccesosApi {
  usuarios: { id: string; nombre: string; email: string; activo: boolean; roles: string[] }[];
  roles: { id: string; nombre: string }[];
  yo: string;
}

// Quién puede entrar al panel y con qué rol. La baja desactiva, no borra.
export default function ListaAccesos() {
  const { datos, cargando, error, recargar } = useDatos<AccesosApi>("/api/configuracion/accesos", 0);
  const [creando, setCreando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [falla, setFalla] = useState<string | null>(null);

  async function alternar(id: string, activo: boolean) {
    setOcupado(id);
    setFalla(null);
    const r = await cambiarAcceso(id, activo);
    setOcupado(null);
    if (r.ok) void recargar();
    else setFalla(r.mensaje ?? "No se pudo cambiar el acceso.");
  }

  if (error && !datos) return <AvisoError onReintentar={recargar}>{error}</AvisoError>;
  if (cargando || !datos) return <p className="text-sm text-pn-suave">Cargando accesos…</p>;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Boton variante="primario" onClick={() => setCreando(true)}>
          Dar de alta
        </Boton>
      </div>

      {falla && (
        <div className="mb-3">
          <AvisoError>{falla}</AvisoError>
        </div>
      )}

      <Bloque sinPadding>
        <ul className="divide-y divide-pn-linea">
          {datos.usuarios.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1 basis-48">
                <p className="font-medium">
                  {u.nombre}
                  {u.id === datos.yo && <span className="ml-2 text-xs font-normal text-pn-suave">(vos)</span>}
                </p>
                <p className="truncate text-sm text-pn-suave">{u.email}</p>
                <p className="mt-1 flex flex-wrap gap-1.5">
                  {u.roles.map((r) => (
                    <Etiqueta key={r}>{r}</Etiqueta>
                  ))}
                  {!u.activo && <Etiqueta tono="peligro">Sin acceso</Etiqueta>}
                </p>
              </div>
              {u.id !== datos.yo && (
                <Boton
                  variante={u.activo ? "peligro" : "secundario"}
                  disabled={ocupado === u.id}
                  onClick={() => alternar(u.id, !u.activo)}
                >
                  {u.activo ? "Quitar acceso" : "Devolver acceso"}
                </Boton>
              )}
            </li>
          ))}
        </ul>
      </Bloque>

      {creando && (
        <FormularioAcceso
          roles={datos.roles}
          onCerrar={() => setCreando(false)}
          onCreado={() => {
            setCreando(false);
            void recargar();
          }}
        />
      )}
    </>
  );
}
