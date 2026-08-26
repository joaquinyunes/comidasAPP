"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function RecuperarPage() {
  return (
    <Suspense fallback={null}>
      <Recuperar />
    </Suspense>
  );
}

function Recuperar() {
  const token = useSearchParams()?.get("token") ?? null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/[0.07] border border-white/10 p-8 text-white">
        <h1 className="text-xl font-bold mb-1">
          {token ? "Nueva contraseña" : "Recuperar contraseña"}
        </h1>
        {token ? <Confirmar token={token} /> : <Solicitar />}
        <p className="mt-6 text-center text-xs text-gray-500">
          <Link href="/login" className="underline">Volver al login</Link>
        </p>
      </div>
    </div>
  );
}

function Solicitar() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => ({}));
    setEnviando(false);
    setMsg(json?.mensaje ?? "Listo. Revisá tu email.");
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <p className="text-sm text-gray-400">Te enviamos un enlace para elegir una nueva contraseña.</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        className="w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-sm"
      />
      {msg && <p className="rounded-lg bg-green-500/10 p-2 text-sm text-green-300">{msg}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-red-600 py-2 text-sm font-semibold disabled:opacity-40"
      >
        {enviando ? "Enviando…" : "Enviar enlace"}
      </button>
    </form>
  );
}

function Confirmar({ token }: { token: string }) {
  const [nueva, setNueva] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    setError(null);
    const res = await fetch("/api/auth/reset/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, nueva }),
    });
    if (res.ok) {
      setEstado("ok");
    } else {
      const json = await res.json().catch(() => ({}));
      setEstado("idle");
      setError(json?.error ?? "No se pudo cambiar la contraseña.");
    }
  }

  if (estado === "ok") {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-green-300">Contraseña actualizada.</p>
        <Link href="/login" className="block rounded-lg bg-red-600 py-2 text-center font-semibold">
          Ir al login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="space-y-3">
      <input
        type="password"
        required
        minLength={8}
        value={nueva}
        onChange={(e) => setNueva(e.target.value)}
        placeholder="Nueva contraseña (mín. 8)"
        className="w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-sm"
      />
      {error && <p className="rounded-lg bg-red-500/10 p-2 text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="w-full rounded-lg bg-red-600 py-2 text-sm font-semibold disabled:opacity-40"
      >
        {estado === "enviando" ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
