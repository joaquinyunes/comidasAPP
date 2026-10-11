"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export type EstadoCamara = "iniciando" | "lista" | "denegada" | "no-disponible";

// Abre la cámara trasera y la conecta al <video>. Libera las pistas al
// desmontar para que el LED de cámara se apague al cerrar el visor.
export function useCamaraStream(videoRef: RefObject<HTMLVideoElement | null>, activa: boolean) {
  const [estado, setEstado] = useState<EstadoCamara>("iniciando");
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!activa) return;
    let cancelado = false;

    async function abrir() {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setEstado("no-disponible");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        setEstado("lista");
      } catch (e) {
        if (cancelado) return;
        const nombre = (e as { name?: string }).name;
        setEstado(nombre === "NotAllowedError" || nombre === "SecurityError" ? "denegada" : "no-disponible");
      }
    }

    void abrir();

    return () => {
      cancelado = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [activa, videoRef]);

  return estado;
}
