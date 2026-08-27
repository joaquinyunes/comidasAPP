"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BotonSalir({ colapsado }: { colapsado: boolean }) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    try {
      await fetch("/api/auth/login", { method: "DELETE" });
    } catch {
      // aunque falle, mandamos al login
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={salir}
      disabled={saliendo}
      title="Cerrar sesión"
      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-red-600 disabled:opacity-40"
    >
      <span className="flex-shrink-0 text-base">🚪</span>
      {!colapsado && <span>{saliendo ? "Saliendo…" : "Cerrar sesión"}</span>}
    </button>
  );
}
