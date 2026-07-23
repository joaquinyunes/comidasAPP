"use client";

import { useState } from "react";
import { SectionHeading } from "./section-heading";
import { SECTION_COPY, SITE } from "@/config/site";
import type { LandingData } from "@/lib/landing-data";

// ============================================================
// RESERVAS — formulario con diseño card mejorado.
// ============================================================
export function Reservas({ sucursal }: { sucursal: LandingData["sucursal"] }) {
  const [form, setForm] = useState({ nombre: "", telefono: "", fecha: "", hora: "", cantidadPersonas: 2, notas: "" });
  const [estado, setEstado] = useState<"idle" | "ok" | "err" | "loading">("idle");
  const [focused, setFocused] = useState<string | null>(null);
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

  const inputClass = (field: string) =>
    `bg-white/5 border rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 ${
      focused === field
        ? "border-[#ff3b6b] bg-white/[0.08] shadow-[0_0_0_3px_rgba(255,59,107,0.1)]"
        : "border-white/10 hover:border-white/20"
    }`;

  return (
    <section id="reservas" className="relative z-10 px-6 sm:px-10 py-20 font-body scroll-mt-28">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-10 overflow-hidden">
          {/* Decoración */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3b6b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <SectionHeading title={SECTION_COPY.reservas.title} accent={SECTION_COPY.reservas.titleAccent} subtitle={SECTION_COPY.reservas.subtitle} />

            {estado === "ok" ? (
              <div className="text-center py-8 animate-scaleIn">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3f8a4d]/20 text-3xl mb-4">✓</div>
                <p className="text-[#3f8a4d] font-bold text-lg">{SECTION_COPY.reservasOk}</p>
                <p className="text-sm opacity-60 mt-2">Te esperamos!</p>
              </div>
            ) : (
              <form onSubmit={enviar} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40">👤</span>
                  <input
                    required
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    onFocus={() => setFocused("nombre")}
                    onBlur={() => setFocused(null)}
                    className={`${inputClass("nombre")} w-full pl-9`}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40">📞</span>
                  <input
                    required
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    onFocus={() => setFocused("telefono")}
                    onBlur={() => setFocused(null)}
                    className={`${inputClass("telefono")} w-full pl-9`}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40">📅</span>
                  <input
                    required
                    type="date"
                    min={hoy}
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    onFocus={() => setFocused("fecha")}
                    onBlur={() => setFocused(null)}
                    className={`${inputClass("fecha")} w-full pl-9 [color-scheme:dark]`}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40">🕐</span>
                  <input
                    required
                    type="time"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                    onFocus={() => setFocused("hora")}
                    onBlur={() => setFocused(null)}
                    className={`${inputClass("hora")} w-full pl-9 [color-scheme:dark]`}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40">👥</span>
                  <input
                    required
                    type="number"
                    min={1}
                    max={20}
                    value={form.cantidadPersonas}
                    onChange={(e) => setForm({ ...form, cantidadPersonas: Number(e.target.value) })}
                    onFocus={() => setFocused("personas")}
                    onBlur={() => setFocused(null)}
                    className={`${inputClass("personas")} w-full pl-9`}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40">📝</span>
                  <input
                    placeholder="Notas (opcional)"
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    onFocus={() => setFocused("notas")}
                    onBlur={() => setFocused(null)}
                    className={`${inputClass("notas")} w-full pl-9`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={estado === "loading"}
                  className="sm:col-span-2 bg-[#ff3b6b] hover:bg-[#ff2a5a] text-white font-bold py-3.5 rounded-xl transition-all duration-200 glow-pulse hover:shadow-[0_8px_30px_rgba(255,59,107,0.3)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                >
                  {estado === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    "Reservar mesa"
                  )}
                </button>
                {estado === "err" && (
                  <p className="sm:col-span-2 text-center text-red-400 text-sm animate-fadeIn">{SECTION_COPY.reservasErr}</p>
                )}
              </form>
            )}

            {sucursal && (
              <p className="text-center text-sm opacity-40 mt-6">📍 {sucursal.direccion} · ☎ {sucursal.telefono}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
