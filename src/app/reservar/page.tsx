"use client";

import { useState } from "react";
import Link from "next/link";
import SiteChrome from "@/components/landing/site-chrome";
import { SITE } from "@/config/site";

const HORAS = ["13:00", "13:30", "14:00", "14:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

export default function ReservarPage() {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    fecha: "",
    hora: "",
    cantidadPersonas: "2",
    notas: "",
  });
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("enviando");
    setMsg("");
    try {
      const res = await fetch("/api/publico/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tenant: SITE.tenantSlug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEstado("error");
        setMsg(data?.error || "No pudimos enviar la reserva. Revisá los datos e intentá de nuevo.");
        return;
      }
      setEstado("ok");
    } catch {
      setEstado("error");
      setMsg("Error de conexión. Intentá de nuevo en un momento.");
    }
  };

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <SiteChrome
      eyebrow="Reservas"
      title={<>Reservá tu <span>mesa</span></>}
      intro="Te confirmamos por teléfono. Para grupos de más de 10 personas, escribinos directamente."
    >
      {estado === "ok" ? (
        <div className="form-ok page-enter-scale">
          <div style={{ fontSize: "3rem" }}>🛸</div>
          <h2>¡Reserva recibida!</h2>
          <p>
            Te esperamos el{" "}
            <strong>
              {new Date(`${form.fecha}T00:00`).toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </strong>{" "}
            a las <strong>{form.hora}</strong> para{" "}
            <strong>{form.cantidadPersonas} {Number(form.cantidadPersonas) === 1 ? "persona" : "personas"}</strong>.
            Te llamamos al {form.telefono} para confirmar.
          </p>
          <Link href="/" className="pop-btn pop-btn-purple">Volver al inicio</Link>
        </div>
      ) : (
        <form className="form-pop" onSubmit={onSubmit}>
          <div className="form-row cols-2">
            <div className="field-pop">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" required minLength={2} value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" />
            </div>
            <div className="field-pop">
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" required minLength={6} value={form.telefono} onChange={set("telefono")} placeholder="55 1234 5678" />
            </div>
          </div>

          <div className="field-pop">
            <label htmlFor="email">Email (opcional)</label>
            <input id="email" type="email" value={form.email} onChange={set("email")} placeholder="vos@correo.com" />
          </div>

          <div className="form-row cols-3">
            <div className="field-pop">
              <label htmlFor="fecha">Fecha</label>
              <input id="fecha" type="date" required min={hoy} value={form.fecha} onChange={set("fecha")} />
            </div>
            <div className="field-pop">
              <label htmlFor="hora">Hora</label>
              <select id="hora" required value={form.hora} onChange={set("hora")}>
                <option value="">Elegí</option>
                {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="field-pop">
              <label htmlFor="personas">Personas</label>
              <select id="personas" value={form.cantidadPersonas} onChange={set("cantidadPersonas")}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-pop">
            <label htmlFor="notas">Comentarios (opcional)</label>
            <textarea id="notas" rows={3} value={form.notas} onChange={set("notas")} placeholder="Alergias, cumpleaños, silla para bebé…" />
          </div>

          {estado === "error" && <div className="form-error" role="alert">{msg}</div>}

          <button type="submit" className="pop-btn pop-btn-red" disabled={estado === "enviando"}>
            {estado === "enviando" ? "Enviando…" : "Reservar mesa"}
          </button>
          <p className="form-note">
            ¿Preferís llamar? {SITE.contacto.telefono}
          </p>
        </form>
      )}
    </SiteChrome>
  );
}
