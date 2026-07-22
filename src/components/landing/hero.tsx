"use client";

import { useState, useRef } from "react";
import { Slice, Leaves } from "./slice";
import { SITE, SABORES } from "@/config/site";

// ============================================================
// HERO — flavor switcher: tocás la pizza y cambia de sabor.
// ============================================================
export function Hero({ direccion }: { direccion?: string | null }) {
  const [index, setIndex] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; dx: string; dy: string }[]>([]);
  const idRef = useRef(0);

  const total = SABORES.length;
  const current = SABORES[index];
  const nextIdx = (index + 1) % total;
  const prevIdx = (index - 1 + total) % total;
  const next2Idx = (index + 2) % total;
  const prev2Idx = (index - 2 + total) % total;

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    setIndex((i) => (i + 1) % total);
    setSpinKey((k) => k + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nuevas = Array.from({ length: 8 }).map(() => {
      const a = Math.random() * Math.PI * 2;
      const d = 40 + Math.random() * 40;
      return { id: idRef.current++, x, y, dx: `${Math.cos(a) * d}px`, dy: `${Math.sin(a) * d}px` };
    });
    setParticles((p) => [...p, ...nuevas]);
    setTimeout(() => setParticles((p) => p.filter((pt) => !nuevas.includes(pt))), 650);
  }

  return (
    <div className="relative z-10 flex flex-col min-h-screen px-6 sm:px-10 pt-28 pb-12 font-body">

      {/* HERO */}
      <div className="flex-1 flex flex-col items-center pt-8">
        <span className="text-xs tracking-[3px] uppercase opacity-60 mb-3 animate-pulse">
          {SITE.businessName} · {SITE.city}
        </span>
        <h1 className="font-display text-center text-3xl sm:text-5xl leading-tight">
          {SITE.tagline}{" "}
          <span key={spinKey} className="text-[#ff3b6b] inline-block caption-anim">{current.name}</span>
        </h1>
        <div className="text-[#ff3b6b] tracking-[6px] my-4">••••••••••</div>

        <div className="relative w-full max-w-3xl flex items-center justify-center select-none" style={{ height: 340 }}>
          <Slice name={SABORES[prev2Idx].name} crust={SABORES[prev2Idx].crust} toppings={SABORES[prev2Idx].toppings}
            className="absolute w-24 sm:w-36 opacity-30 brightness-50" style={{ left: "0%", top: "36%", transform: "rotate(-18deg)" } as React.CSSProperties} />
          <Slice name={SABORES[prevIdx].name} crust={SABORES[prevIdx].crust} toppings={SABORES[prevIdx].toppings}
            className="absolute w-24 sm:w-36 opacity-45 brightness-[.6]" style={{ left: "14%", top: "8%", transform: "rotate(-8deg)" } as React.CSSProperties} />
          <Slice name={SABORES[nextIdx].name} crust={SABORES[nextIdx].crust} toppings={SABORES[nextIdx].toppings}
            className="absolute w-24 sm:w-36 opacity-45 brightness-[.6]" style={{ right: "14%", top: "8%", transform: "rotate(8deg) scaleX(-1)" } as React.CSSProperties} />
          <Slice name={SABORES[next2Idx].name} crust={SABORES[next2Idx].crust} toppings={SABORES[next2Idx].toppings}
            className="absolute w-24 sm:w-36 opacity-30 brightness-50" style={{ right: "0%", top: "36%", transform: "rotate(18deg) scaleX(-1)" } as React.CSSProperties} />

          <div className="relative z-10 cursor-pointer tap-scale" style={{ width: 220 }} onClick={handleTap} role="button" aria-label="Tocar para cambiar de sabor">
            <div className="absolute -inset-4 border-2 border-dashed border-[#f4ecd8]/40 rounded-[50%/40%] ring-spin pointer-events-none" />
            <Slice key={spinKey} name={current.name} crust={current.crust} toppings={current.toppings}
              className="w-full h-auto slice-anim" style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,.55))" } as React.CSSProperties} />
            {particles.map((p) => (
              <span key={p.id} className="crumb absolute w-2 h-2 rounded-full bg-[#e8b93a]" style={{ left: p.x, top: p.y, ["--dx" as string]: p.dx, ["--dy" as string]: p.dy } as React.CSSProperties} />
            ))}
          </div>
        </div>

        <p key={"cap-" + spinKey} className="font-script text-xl sm:text-2xl text-[#ffd23f] text-center mt-2 caption-anim min-h-[2.5rem]">{current.caption}</p>
        <p className="text-xs tracking-widest uppercase opacity-60 pulse-hint mt-1">{SITE.heroHint}</p>

        {direccion && (
          <p className="text-sm text-[#f4ecd8]/70 mt-3">📍 {direccion}</p>
        )}
        <a href="#carta" className="mt-5 text-sm text-[#ff3b6b] border border-[#ff3b6b]/50 rounded-full px-6 py-2 hover:bg-[#ff3b6b] hover:text-white transition-colors">Explorar la carta ↓</a>
      </div>
    </div>
  );
}
