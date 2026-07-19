"use client";

import { useEffect, useState, useCallback } from "react";
import { cn, formatCurrency } from "@/lib/utils";

// ============================================
// CARRUSEL DE PIZZAS (estilo coverflow)
// La pizza central viene hacia adelante, las
// laterales quedan atrás en perspectiva.
// ============================================

export interface PizzaCarrusel {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string | null;
  destacado?: boolean;
}

type Pizza = PizzaCarrusel;

// Emoji por defecto cuando la pizza no tiene imagen (forma de pizza)
const EMOJIS = ["🍕", "🍕", "🍕", "🍕", "🍕", "🍕"];

function PizzaVisual({ pizza, emoji }: { pizza: Pizza; emoji: string }) {
  if (pizza.imagenUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={pizza.imagenUrl} alt={pizza.nombre} className="w-full h-full object-cover" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500">
      <span className="text-7xl drop-shadow-lg">{emoji}</span>
    </div>
  );
}

function PizzaCard({
  pizza,
  emoji,
  pos,
  total,
  onSelect,
}: {
  pizza: Pizza;
  emoji: string;
  pos: number;
  total: number;
  onSelect: () => void;
}) {
  // pos: distancia desde el centro (0 = central)
  const abs = Math.abs(pos);
  const sign = Math.sign(pos);
  const isCenter = pos === 0;

  const style: React.CSSProperties = {
    transform: `translateX(${sign * abs * 55}%) translateZ(${-abs * 220}px) rotateY(${-sign * 38}deg) scale(${isCenter ? 1 : 0.82})`,
    zIndex: total - abs,
    opacity: abs > 2 ? 0 : 1,
    pointerEvents: isCenter ? "auto" : "auto",
    transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease",
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      style={style}
      className={cn(
        "absolute top-1/2 left-1/2 w-56 h-64 -ml-28 -mt-32 rounded-2xl overflow-hidden shadow-2xl border-4 outline-none",
        isCenter
          ? "border-yellow-300 cursor-default"
          : "border-white/60 hover:border-yellow-200 cursor-pointer"
      )}
    >
      <div className="relative w-full h-full">
        <PizzaVisual pizza={pizza} emoji={emoji} />
        {pizza.destacado && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            🔥 Popular
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left">
          <h3 className="text-white font-bold text-lg leading-tight">{pizza.nombre}</h3>
          {pizza.descripcion && (
            <p className="text-white/80 text-xs line-clamp-2 mt-0.5">{pizza.descripcion}</p>
          )}
          <p className="text-yellow-300 font-extrabold mt-1">{formatCurrency(pizza.precio)}</p>
        </div>
      </div>
    </button>
  );
}

export function CarruselPizzas({ pizzas }: { pizzas: Pizza[] }) {
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = pizzas.length;

  const ir = useCallback(
    (dir: number) => setActivo((p) => (p + dir + total) % total),
    [total]
  );

  useEffect(() => {
    if (pausado || total <= 1) return;
    const id = setInterval(() => ir(1), 3000);
    return () => clearInterval(id);
  }, [pausado, ir, total]);

  if (total === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <Badge className="bg-red-600 mb-3">🍕 Nuestras Pizzas</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">El gusto que gira en tu mesa</h2>
          <p className="text-gray-400 mt-2">Pasa el mouse para pausar y elegí tu favorita</p>
        </div>

        <div
          className="relative h-80 [perspective:1200px]"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            {pizzas.map((pizza, i) => {
              let pos = i - activo;
              if (pos > total / 2) pos -= total;
              if (pos < -total / 2) pos += total;
              return (
                <PizzaCard
                  key={pizza.id}
                  pizza={pizza}
                  emoji={EMOJIS[i % EMOJIS.length]}
                  pos={pos}
                  total={total}
                  onSelect={() => setActivo(i)}
                />
              );
            })}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => ir(-1)}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-2xl transition-colors"
            aria-label="Anterior"
          >
            ‹
          </button>
          <div className="flex gap-2">
            {pizzas.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivo(i)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  i === activo ? "bg-yellow-400 w-6" : "bg-white/30 hover:bg-white/50"
                )}
                aria-label={`Ir a ${p.nombre}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => ir(1)}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-2xl transition-colors"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

// Pequeño helper de Badge local para no acoplar imports innecesarios
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block text-xs font-semibold px-3 py-1 rounded-full", className)}>
      {children}
    </span>
  );
}
