"use client";

import { useState, useMemo } from "react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { SECTION_COPY, CARTA_FILTROS } from "@/config/site";
import type { CategoriaLanding, ProductoLanding } from "@/lib/landing-data";

// ============================================================
// CARTA — categorías, búsqueda, filtros, carrito y notas.
// ============================================================
export function Carta({ carta }: { carta: CategoriaLanding[] }) {
  const [catActiva, setCatActiva] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState<Record<string, boolean>>({});
  const [carrito, setCarrito] = useState<Record<string, { p: ProductoLanding; cant: number; notas: string }>>({});
  const [notasId, setNotasId] = useState<string | null>(null);
  const [notasTxt, setNotasTxt] = useState("");

  const productosFiltrados = useMemo(() => {
    const term = busqueda.toLowerCase();
    const out: { p: ProductoLanding }[] = [];
    for (const c of carta) {
      if (catActiva && c.id !== catActiva) continue;
      for (const p of c.productos) {
        if (term && !p.nombre.toLowerCase().includes(term) && !(p.descripcion || "").toLowerCase().includes(term)) continue;
        if (filtros.veggie && !CARTA_FILTROS[0].test(p.tipo || "", p.alergenos)) continue;
        if (filtros.picante && !CARTA_FILTROS[1].test(p.tipo || "", p.alergenos, p.nivelPicante || 0)) continue;
        out.push({ p });
      }
    }
    return out;
  }, [carta, catActiva, busqueda, filtros]);

  const total = Object.values(carrito).reduce((s, i) => s + i.p.precio * i.cant, 0);
  const cantidad = Object.values(carrito).reduce((s, i) => s + i.cant, 0);

  const agregar = (p: ProductoLanding) =>
    setCarrito((prev) => ({ ...prev, [p.id]: { p, cant: (prev[p.id]?.cant || 0) + 1, notas: prev[p.id]?.notas || "" } }));
  const quitar = (id: string) =>
    setCarrito((prev) => {
      const n = { ...prev };
      if (n[id].cant > 1) n[id] = { ...n[id], cant: n[id].cant - 1 };
      else delete n[id];
      return n;
    });
  const guardarNotas = () => {
    if (notasId) setCarrito((prev) => ({ ...prev, [notasId]: { ...prev[notasId], notas: notasTxt } }));
    setNotasId(null); setNotasTxt("");
  };

  return (
    <section id="carta" className="relative z-10 px-6 sm:px-10 py-16 scroll-mt-28">
      <div className="max-w-5xl mx-auto font-body">
        <SectionHeading id="carta-heading" title={SECTION_COPY.carta.title} accent={SECTION_COPY.carta.titleAccent} subtitle={SECTION_COPY.carta.subtitle} />

        {/* Buscador + filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar en la carta…"
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-[#ff3b6b] transition-colors"
          />
          {CARTA_FILTROS.map((f) => (
            <button key={f.id} onClick={() => setFiltros((p) => ({ ...p, [f.id]: !p[f.id] }))}
              className={`px-4 py-3 rounded-full text-xs font-semibold transition-colors ${filtros[f.id] ? "bg-[#3f8a4d] text-white" : "bg-white/5 border border-white/10"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          <button onClick={() => setCatActiva(null)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${!catActiva ? "bg-[#ff3b6b] text-white" : "bg-white/5 text-[#f4ecd8]/80 hover:bg-white/10"}`}>Todo</button>
          {carta.map((c) => (
            <button key={c.id} onClick={() => setCatActiva(c.id)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${catActiva === c.id ? "bg-[#ff3b6b] text-white" : "bg-white/5 text-[#f4ecd8]/80 hover:bg-white/10"}`}>{c.nombre}</button>
          ))}
        </div>

        {/* Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productosFiltrados.map(({ p }, idx) => {
            const item = carrito[p.id];
            return (
              <Reveal key={p.id} delay={idx * 40}>
                <div className="card-hover bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex gap-4 h-full">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                    {p.imagenUrl ? <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" /> : "🍕"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">{p.nombre}</h3>
                      <span className="font-bold text-[#ff3b6b] whitespace-nowrap">${Number(p.precio).toLocaleString("es-AR")}</span>
                    </div>
                    {p.descripcion && <p className="text-xs opacity-60 line-clamp-2 mt-1">{p.descripcion}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.tiempoPreparacionMin ? <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">⏱ {p.tiempoPreparacionMin}′</span> : null}
                      {p.nivelPicante && p.nivelPicante > 0 ? <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">🌶 {p.nivelPicante}</span> : null}
                      {p.destacado ? <span className="text-[10px] bg-[#ff3b6b] px-2 py-0.5 rounded-full">🔥 Popular</span> : null}
                      {p.alergenos.map((a) => <span key={a} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">⚠ {a}</span>)}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {item ? (
                        <>
                          <button onClick={() => quitar(p.id)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20">−</button>
                          <span className="w-6 text-center font-bold">{item.cant}</span>
                          <button onClick={() => agregar(p)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20">+</button>
                          <button onClick={() => { setNotasId(p.id); setNotasTxt(item.notas); }} className="text-xs opacity-60 hover:opacity-100 ml-1">📝 nota</button>
                        </>
                      ) : (
                        <button onClick={() => agregar(p)} className="bg-[#ff3b6b] hover:bg-[#ff2a5a] text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors">+ Agregar</button>
                      )}
                    </div>
                    {item?.notas && <p className="text-[11px] text-[#ffd23f] mt-1">📝 {item.notas}</p>}
                  </div>
                </div>
              </Reveal>
            );
          })}
          {productosFiltrados.length === 0 && <p className="col-span-full text-center opacity-50 py-10">No encontramos platos con esos filtros.</p>}
        </div>

        {/* Modal notas */}
        {notasId && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setNotasId(null)}>
            <div className="bg-[#1c1a1a] rounded-2xl p-6 max-w-sm w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display mb-3">Notas para el plato</h3>
              <input autoFocus value={notasTxt} onChange={(e) => setNotasTxt(e.target.value)} placeholder="Ej: sin cebolla, extra queso…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff3b6b]" />
              <div className="flex gap-2 mt-4">
                <button onClick={() => setNotasId(null)} className="flex-1 py-2.5 rounded-full bg-white/10">Cancelar</button>
                <button onClick={guardarNotas} className="flex-1 py-2.5 rounded-full bg-[#ff3b6b] text-white font-semibold">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* Barra del carrito */}
        {cantidad > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#ff3b6b] text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 font-body pop-in">
            <span className="font-semibold">🛒 {cantidad} {cantidad === 1 ? "item" : "items"}</span>
            <span className="font-bold">${total.toLocaleString("es-AR")}</span>
            <button onClick={() => alert("Pedido enviado a cocina 🍕 (demo)")} className="bg-white text-[#ff3b6b] font-bold px-4 py-1.5 rounded-full text-sm">Enviar a cocina</button>
          </div>
        )}
      </div>
    </section>
  );
}
