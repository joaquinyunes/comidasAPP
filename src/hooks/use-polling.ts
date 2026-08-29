import { useEffect, useRef } from "react";

/**
 * Ejecuta `cargar` al montar y luego cada `intervaloMs`.
 * Aísla fallos: un error en `cargar` se registra y no corta el ciclo ni propaga.
 * `cargar` puede cambiar de identidad entre renders sin reiniciar el intervalo.
 */
export function usePolling(cargar: () => Promise<void> | void, intervaloMs: number) {
  const cargarRef = useRef(cargar);

  useEffect(() => {
    cargarRef.current = cargar;
  });

  useEffect(() => {
    let activo = true;

    const tick = async () => {
      if (!activo) return;
      try {
        await cargarRef.current();
      } catch (error) {
        console.error("usePolling: fallo al cargar", error);
      }
    };

    void tick();
    const id = setInterval(tick, intervaloMs);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, [intervaloMs]);
}
