"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  titulo: string;
  subtitulo?: string;
  onCerrar: () => void;
  children: ReactNode;
  pie?: ReactNode;
  ancho?: "normal" | "amplio";
}

// Hoja lateral: en el celular ocupa toda la pantalla, en escritorio
// se abre a la derecha sin tapar del todo lo que hay detrás.
export default function Hoja({ titulo, subtitulo, onCerrar, children, pie, ancho = "normal" }: Props) {
  const cerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cerrar.current?.focus();
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", alTeclear);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflow;
    };
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={titulo}>
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={onCerrar}
        className="absolute inset-0 bg-pn-tinta/45"
      />
      <section
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col bg-pn-fondo sm:border-l sm:border-pn-linea",
          ancho === "amplio" ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-pn-linea bg-pn-papel px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{titulo}</h2>
            {subtitulo && <p className="truncate text-sm text-pn-suave">{subtitulo}</p>}
          </div>
          <button
            ref={cerrar}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid size-10 shrink-0 place-items-center rounded-md hover:bg-pn-hundido"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {pie && <footer className="border-t border-pn-linea bg-pn-papel p-3">{pie}</footer>}
      </section>
    </div>
  );
}
