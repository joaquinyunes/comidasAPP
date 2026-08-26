"use client";

import { useState } from "react";

export default function CambiarPassword() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    setError(null);
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actual, nueva }),
    });
    if (res.ok) {
      setEstado("ok");
      setActual("");
      setNueva("");
    } else {
      const json = await res.json().catch(() => ({}));
      setEstado("idle");
      setError(json?.error ?? "No se pudo cambiar la contraseña.");
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-3 rounded-2xl border border-zinc-200 p-5">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">Contraseña actual</label>
        <input
          type="password"
          required
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">Nueva contraseña (mín. 8)</label>
        <input
          type="password"
          required
          minLength={8}
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      {estado === "ok" && (
        <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">Contraseña actualizada.</p>
      )}
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {estado === "enviando" ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
