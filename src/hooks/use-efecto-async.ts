import { useEffect, type DependencyList } from "react";

/**
 * Corre una función async como efecto cuando cambian `deps`.
 * Aísla fallos: un error en `efecto` se registra y no propaga al render.
 */
export function useEfectoAsync(efecto: () => Promise<void> | void, deps: DependencyList) {
  useEffect(() => {
    void (async () => {
      try {
        await efecto();
      } catch (error) {
        console.error("useEfectoAsync: fallo en el efecto", error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
