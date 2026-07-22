"use client";

import { useState } from "react";
import { SectionHeading } from "./section-heading";
import { SECTION_COPY, SITE } from "@/config/site";
import type { LandingData } from "@/lib/landing-data";

// ============================================================
// RESERVAS — formulario que guarda en la BD.
// ============================================================
export function Reservas({ sucursal }: { sucursal: LandingData["sucursal"] }) {
  const [form, setForm] = useState({ nombre: "", telefono: "", fecha: "", hora: "", cantidadPersonas: 2, notas: "" });
  const [estado, setEstado] = useState<"idle" | "ok" | "err" | "loading">("idle");
  const hoy = new Date().toISOString().slice(0, 10);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("loading");
    try {
      const res = await fetch("/api/publico/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tenant: SITE.tenantSlug }),
      });
      setEstado(res.ok ? "ok" : "err");
    } catch {
      setEstado("err");
    }
  };

  return (
    <section id="reservas" className="relative z-10 px-6 sm:px-10 py-16 font-body scroll-mt-28">
      <div className="max-w-3xl mx-auto bg-white/[0.04] border border-white/10 rounded-3xl p-8">
        <SectionHeading title={SECTION_COPY.reservas.title} accent={SECTION_COPY.reservas.titleAccent} subtitle={SECTION_COPY.reservas.subtitle} />
        {estado === "ok" ? (
          <p className="text-center text-[#3f8a4d] font-bold text-lg pop-in">{SECTION_COPY.reservasOk}</p>
        ) : (
          <form onSubmit={enviar} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff3b6b]" />
            <input required placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff3b6b]" />
            <input required type="date" min={hoy} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff3b6b] [color-scheme:dark]" />
            <input required type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff3b6b] [color-scheme:dark]" />
            <input required type="number" min={1} max={20} value={form.cantidadPersonas} onChange={(e) => setForm({ ...form, cantidadPersonas: Number(e.target.value) })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff3b6b]" />
            <input placeholder="Notas (opcional)" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ff3b6b]" />
            <button type="submit" disabled={estado === "loading"} className="sm:col-span-2 bg-[#ff3b6b] hover:bg-[#ff2a5a] text-white font-bold py-3 rounded-xl transition-colors glow-pulse">
              {estado === "loading" ? "Enviando…" : "Reservar mesa"}
            </button>
            {estado === "err" && <p className="sm:col-span-2 text-center text-red-400 text-sm">{SECTION_COPY.reservasErr}</p>}
          </form>
        )}
        {sucursal && (
          <p className="text-center text-sm opacity-60 mt-6">📍 {sucursal.direccion} · ☎ {sucursal.telefono}</p>
        )}
      </div>
    </section>
  );
}
