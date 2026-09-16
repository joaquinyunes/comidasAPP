"use client";

import { useState, type ReactNode } from "react";

// Sección plegable de la carta: arranca cerrada, un toque la abre.
export default function CategoriaAcordeon({ nombre, children }: { nombre: string; children: ReactNode }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <section className="mb-5">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-black bg-white px-5 py-4 text-left font-semibold text-zinc-800"
      >
        <span>{nombre}</span>
        <span aria-hidden="true" className={`shrink-0 text-lg transition-transform ${abierta ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {abierta && <div className="mt-4">{children}</div>}
    </section>
  );
}
