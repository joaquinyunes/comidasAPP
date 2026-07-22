"use client";

import type { CSSProperties } from "react";

// ============================================================
// Porción de pizza (SVG) y hoja de albahaca (SVG).
// ============================================================

export interface SliceProps {
  name: string;
  crust: string;
  toppings: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Slice({ name, crust, toppings, className = "", style = {} }: SliceProps) {
  return (
    <svg viewBox="0 0 200 260" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`cheese-${name}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe6a0" />
          <stop offset="100%" stopColor="#ffcf5c" />
        </linearGradient>
      </defs>
      <path d="M100 250 L28 40 Q100 -6 172 40 Z" fill={`url(#cheese-${name})`} stroke="#c9922b" strokeWidth="3" />
      <path d="M28 40 Q100 -6 172 40 Q100 34 28 40 Z" fill={crust} />
      {toppings}
    </svg>
  );
}

export function Leaf({ className = "", style = {} }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 140" className={className} style={style} aria-hidden="true">
      <path d="M50 5 C90 20 95 80 50 135 C5 80 10 20 50 5 Z" fill="#3f8a4d" />
      <path d="M50 15 L50 125" stroke="#2c6238" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// Hojas decorativas flotantes en las esquinas.
export function Leaves() {
  return (
    <>
      <Leaf className="leaf-float absolute w-24 -top-2 -left-4 opacity-90 pointer-events-none" style={{ ["--r" as string]: "-15deg" } as CSSProperties} />
      <Leaf className="leaf-float absolute w-20 top-32 right-6 opacity-80 -scale-x-100 pointer-events-none" style={{ ["--r" as string]: "20deg" } as CSSProperties} />
      <Leaf className="leaf-float absolute w-16 bottom-28 left-10 opacity-80 pointer-events-none" style={{ ["--r" as string]: "35deg" } as CSSProperties} />
      <Leaf className="leaf-float absolute w-20 bottom-14 right-14 opacity-90 -scale-x-100 pointer-events-none" style={{ ["--r" as string]: "-25deg" } as CSSProperties} />
    </>
  );
}
