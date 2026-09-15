"use client";

import { useCallback, type RefObject } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap-client";

const SELECTOR = ".pop-btn:not([data-magnetic-bound])";

function bindMagnetic(root: HTMLElement) {
  const buttons = gsap.utils.toArray<HTMLElement>(SELECTOR, root);
  buttons.forEach((btn) => {
    btn.setAttribute("data-magnetic-bound", "1");
    const xTo = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3" });

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      xTo(dx * 0.25);
      yTo(dy * 0.35);
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    });
  });
}

// Efecto "magnético": los botones .pop-btn dentro del scope siguen levemente
// al cursor y vuelven a su lugar con un rebote elástico al salir. Sólo se
// activa con mouse fino (no táctil) y respeta reduced-motion. Expone un
// `rescan` para enganchar botones que montan después (datos async).
export function useMagneticButtons(scopeRef: RefObject<HTMLElement | null>) {
  const enabled =
    typeof window !== "undefined" && !prefersReducedMotion() && window.matchMedia("(pointer: fine)").matches;

  const { contextSafe } = useGSAP(
    () => {
      if (!enabled || !scopeRef.current) return;
      bindMagnetic(scopeRef.current);
    },
    { scope: scopeRef }
  );

  return useCallback(() => {
    contextSafe(() => {
      if (!enabled || !scopeRef.current) return;
      bindMagnetic(scopeRef.current);
    })();
  }, [contextSafe, enabled, scopeRef]);
}
