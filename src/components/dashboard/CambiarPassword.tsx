"use client";

import { useId, useState } from "react";
import Boton from "@/components/panel/ui/Boton";
import AvisoError from "@/components/panel/ui/AvisoError";

export default function CambiarPassword() {
  const idActual = useId();
  const idNueva = useId();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    setError(null);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual, nueva }),
      });
      if (res.ok) {
        setEstado("ok");
        setActual("");
        setNueva("");
        return;
      }
      const json = await res.json().catch(() => ({}));
      setError(json?.error ?? "No se pudo cambiar la contraseña.");
    } catch {
      setError("Sin conexión. Probá de nuevo.");
    }
    setEstado("idle");
  }

  const campo =
    "min-h-11 w-full rounded-md border border-pn-linea-fuerte bg-pn-papel px-3 text-base";

  return (
    <form onSubmit={guardar} className="space-y-4 rounded-lg border border-pn-linea bg-pn-papel p-4">
      <div>
        <label htmlFor={idActual} className="mb-1 block text-sm font-medium">
          Contraseña actual
        </label>
        <input
          id={idActual}
          type="password"
          autoComplete="current-password"
          required
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          className={campo}
        />
      </div>
      <div>
        <label htmlFor={idNueva} className="mb-1 block text-sm font-medium">
          Contraseña nueva <span className="font-normal text-pn-suave">(mínimo 8 caracteres)</span>
        </label>
        <input
          id={idNueva}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          className={campo}
        />
      </div>

      {error && <AvisoError>{error}</AvisoError>}
      {estado === "ok" && (
        <p role="status" className="rounded-md bg-pn-ok-fondo px-3 py-2 text-sm text-pn-ok">
          Listo, la contraseña se actualizó.
        </p>
      )}

      <Boton type="submit" variante="primario" tamano="grande" className="w-full" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Guardando…" : "Cambiar contraseña"}
      </Boton>
    </form>
  );
}
