"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, CameraOff, Crosshair, CreditCard, X } from "lucide-react";
import CamaraFicha from "./CamaraFicha";
import CamaraProducto from "./CamaraProducto";
import CamaraTarjetaReferencia from "./CamaraTarjetaReferencia";
import { pxPorCmInicial } from "./escala";
import { resolverTamano } from "./tamano-estimado";
import type { ProductoCamara } from "./tipos";
import { useCamaraStream } from "./use-camara-stream";
import { useGestoEscala } from "./use-gesto-escala";
import { useImagenRecortada } from "./use-imagen-recortada";

const MENSAJES = {
  denegada: "Sin permiso de cámara. Igual podés ver el tamaño real sobre la mesa de fondo.",
  "no-disponible":
    "No pudimos abrir la cámara (hace falta HTTPS o un equipo con cámara). Mirá el tamaño real igual.",
} as const;

// Visor "ver en tu mesa": cámara en vivo con el producto a tamaño real y la
// ficha de lo que trae. Pantalla completa, se cierra con Esc o la X.
export default function CamaraVisor({
  producto,
  onCerrar,
}: {
  producto: ProductoCamara;
  onCerrar: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const escenarioRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const [anchoEscenario, setAnchoEscenario] = useState(() =>
    typeof window === "undefined" ? 390 : Math.min(window.innerWidth, 900)
  );
  const [verTarjeta, setVerTarjeta] = useState(true);

  const estado = useCamaraStream(videoRef, true);
  const tamano = useMemo(() => resolverTamano(producto), [producto]);
  const imagen = useImagenRecortada(producto.imagenUrl);
  const gesto = useGestoEscala(anchoEscenario);

  // Ancho real del escenario (en escritorio comparte pantalla con la ficha).
  useEffect(() => {
    const el = escenarioRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setAnchoEscenario(Math.round(entry.contentRect.width)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Esc cierra, el scroll de fondo se bloquea y el foco vuelve al botón.
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previo?.focus?.();
    };
  }, [onCerrar]);

  const inicial = pxPorCmInicial(anchoEscenario || 390);
  const zoom = gesto.pxPorCm / inicial;
  const mensaje = estado === "denegada" || estado === "no-disponible" ? MENSAJES[estado] : null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="cam-visor" role="dialog" aria-modal="true" aria-label={`${producto.nombre} en tu mesa`}>
      <div
        className="cam-escenario"
        ref={escenarioRef}
        style={{ "--px-cm": gesto.pxPorCm } as React.CSSProperties}
        {...gesto.handlers}
      >
        <video
          ref={videoRef}
          className={`cam-video ${estado === "lista" ? "is-lista" : ""}`}
          playsInline
          muted
          autoPlay
        />
        {estado !== "lista" && <div className="cam-mesa-falsa" aria-hidden="true" />}

        <div className="cam-centro">
          {imagen.url && (
            <CamaraProducto
              url={imagen.url}
              nombre={producto.nombre}
              tamano={tamano}
              pxPorCm={gesto.pxPorCm}
              offset={gesto.offset}
              mezclar={!imagen.recortada}
            />
          )}
          {verTarjeta && <CamaraTarjetaReferencia pxPorCm={gesto.pxPorCm} />}
        </div>

        <div className="cam-barra">
          <button
            ref={cerrarRef}
            type="button"
            className="cam-icono"
            onClick={onCerrar}
            aria-label="Cerrar cámara"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <X size={20} aria-hidden="true" />
          </button>
          <div className="cam-estado" aria-live="polite">
            {estado === "lista" ? <Camera size={16} aria-hidden="true" /> : <CameraOff size={16} aria-hidden="true" />}
            <span>{estado === "iniciando" ? "Abriendo cámara…" : estado === "lista" ? "Cámara en vivo" : "Sin cámara"}</span>
          </div>
          <div className="cam-acciones" onPointerDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`cam-icono ${verTarjeta ? "is-activo" : ""}`}
              onClick={() => setVerTarjeta((v) => !v)}
              aria-pressed={verTarjeta}
              aria-label="Mostrar tarjeta de referencia"
            >
              <CreditCard size={18} aria-hidden="true" />
            </button>
            <button type="button" className="cam-icono" onClick={gesto.centrar} aria-label="Centrar producto">
              <Crosshair size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {mensaje && <p className="cam-aviso" role="status">{mensaje}</p>}

        <div className="cam-ayuda" onPointerDown={(e) => e.stopPropagation()}>
          <p>Apoyá una tarjeta en la mesa y agrandá o achicá hasta que coincida con la silueta: ahí ves el tamaño real.</p>
          <label className="cam-escala">
            <span>Escala</span>
            <input
              type="range"
              min={0.4}
              max={2.5}
              step={0.01}
              value={Math.min(2.5, Math.max(0.4, zoom))}
              onChange={(e) => gesto.fijarPxPorCm(inicial * Number(e.target.value))}
              aria-label="Ajustar escala"
            />
          </label>
        </div>
      </div>

      <CamaraFicha producto={producto} tamano={tamano} />
    </div>,
    document.body
  );
}
