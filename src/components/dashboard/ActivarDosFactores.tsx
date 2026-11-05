"use client";

import { useEffect, useId, useState } from "react";
import Boton from "@/components/panel/ui/Boton";
import AvisoError from "@/components/panel/ui/AvisoError";

// Activar / desactivar el segundo factor (app de códigos) de la propia cuenta.
type Paso = "cargando" | "inactivo" | "escaneando" | "activo";

const campo = "min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base";

export default function ActivarDosFactores() {
  const idCodigo = useId();
  const idClave = useId();
  const [paso, setPaso] = useState<Paso>("cargando");
  const [secreto, setSecreto] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    fetch("/api/auth/2fa")
      .then((r) => r.json())
      .then((j) => setPaso(j?.data?.activo ? "activo" : "inactivo"))
      .catch(() => setPaso("inactivo"));
  }, []);

  async function llamar(metodo: "POST" | "PUT" | "DELETE", cuerpo?: object) {
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setError(json?.error ?? "No se pudo completar.");
      return res.ok ? json : null;
    } catch {
      setError("Sin conexión. Probá de nuevo.");
      return null;
    } finally {
      setOcupado(false);
    }
  }

  async function empezar() {
    const j = await llamar("POST");
    if (j) {
      setSecreto(j.data.secreto);
      setPaso("escaneando");
    }
  }

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (await llamar("PUT", { codigo })) {
      setPaso("activo");
      setCodigo("");
    }
  }

  async function desactivar(e: React.FormEvent) {
    e.preventDefault();
    if (await llamar("DELETE", { codigo, password })) {
      setPaso("inactivo");
      setCodigo("");
      setPassword("");
    }
  }

  if (paso === "cargando") return null;

  return (
    <section className="space-y-3 rounded-lg border border-pn-linea bg-pn-papel p-4" aria-labelledby={idCodigo + "-t"}>
      <h2 id={idCodigo + "-t"} className="text-base font-semibold">
        Verificación en dos pasos
      </h2>

      {paso === "inactivo" && (
        <>
          <p className="text-sm text-pn-suave">
            Además de la contraseña, el ingreso pide un código de 6 números de tu celular. Recomendado para quien administra.
          </p>
          <Boton variante="primario" tamano="grande" className="w-full" onClick={empezar} disabled={ocupado}>
            Activar
          </Boton>
        </>
      )}

      {paso === "escaneando" && (
        <form onSubmit={confirmar} className="space-y-3">
          <p className="text-sm text-pn-suave">
            En tu app de códigos (Google Authenticator, Authy, 1Password…) agregá una cuenta con esta clave y escribí el código que muestra.
          </p>
          <p id={idClave} className="select-all break-all rounded-md bg-pn-hundido px-3 py-2 font-mono text-sm" aria-label="Clave para la app">
            {secreto}
          </p>
          <label htmlFor={idCodigo} className="block text-sm font-medium">
            Código de 6 números
          </label>
          <input
            id={idCodigo}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className={campo}
          />
          <Boton type="submit" variante="primario" tamano="grande" className="w-full" disabled={ocupado || codigo.length !== 6}>
            Confirmar y activar
          </Boton>
        </form>
      )}

      {paso === "activo" && (
        <form onSubmit={desactivar} className="space-y-3">
          <p role="status" className="rounded-md bg-pn-ok-fondo px-3 py-2 text-sm text-pn-ok">
            Activo. Para desactivarlo, confirmá tu contraseña y un código vigente.
          </p>
          <input
            type="password"
            aria-label="Contraseña actual"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={campo}
          />
          <input
            inputMode="numeric"
            aria-label="Código de 6 números"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className={campo}
          />
          <Boton type="submit" variante="peligro" className="w-full" disabled={ocupado || codigo.length !== 6}>
            Desactivar
          </Boton>
        </form>
      )}

      {error && <AvisoError>{error}</AvisoError>}
    </section>
  );
}
