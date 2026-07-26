"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ============================================================
// Reveal: anima la entrada de una sección al hacer scroll.
// Soporta varias direcciones: up, down, left, right, scale.
// ============================================================
type RevealDirection = "up" | "down" | "left" | "right" | "scale";

const directionStyles: Record<RevealDirection, { from: string; to: string }> = {
  up:    { from: "opacity-0 translate-y-8",  to: "opacity-100 translate-y-0" },
  down:  { from: "opacity-0 -translate-y-8", to: "opacity-100 translate-y-0" },
  left:  { from: "opacity-0 translate-x-8",  to: "opacity-100 translate-x-0" },
  right: { from: "opacity-0 -translate-x-8", to: "opacity-100 translate-x-0" },
  scale: { from: "opacity-0 scale-95",       to: "opacity-100 scale-100" },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  duration?: number;
  once?: boolean;
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 600,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const styles = directionStyles[direction];

  return (
    <div
      ref={ref}
      className={`transition-all ${styles.from} ${visible ? styles.to : ""} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}
