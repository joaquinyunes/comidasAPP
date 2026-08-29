"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useLandingData } from "@/lib/landing-data";
import { useCarrito, type ItemMenu } from "@/components/cliente/useCarrito";
import CuponInput from "@/components/cliente/CuponInput";
import { SITE } from "@/config/site";
import { useZonas } from "./useZonas";
import { enviarDelivery, nuevaClave, type DatosEntrega } from "./enviarDelivery";

export default function OrdenarDelivery() {
  const { data, loading } = useLandingData();
  const { zonas, error: zonasError } = useZonas();

  const catalogo: ItemMenu[] = useMemo(
    () =>
      (data?.carta ?? []).flatMap((c) =>
        c.productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion ?? null,
          precio: p.precio,
          alergenos: p.alergenos ?? [],
          nivelPicante: p.nivelPicante ?? 0,
          tiempoMin: p.tiempoPreparacionMin ?? null,
        }))
      ),
    [data]
  );
  const carrito = useCarrito(catalogo);

  const [datos, setDatos] = useState<DatosEntrega>({
    nombre: "",
    telefono: "",
    direccion: "",
    zonaId: "",
    notas: "",
  });
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number } | null>(null);
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [resumen, setResumen] = useState<{ total: number; minutos: number } | null>(null);
  const claveRef = useRef(nuevaClave());
  const confirmacionRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (estado === "ok") confirmacionRef.current?.focus();
  }, [estado]);

  const zona = zonas.find((z) => z.id === datos.zonaId);
  const envio = zona?.costoEnvio ?? 0;
  const descuento = cupon?.descuento ?? 0;
  const total = Math.max(0, carrito.totalMonto - descuento) + envio;
  const puedeEnviar =
    carrito.totalItems > 0 &&
    datos.nombre.trim().length >= 2 &&
    datos.telefono.trim().length >= 6 &&
    datos.direccion.trim().length >= 5 &&
    !!datos.zonaId;

  const set = (k: keyof DatosEntrega) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setDatos({ ...datos, [k]: e.target.value });

  async function enviar() {
    if (!puedeEnviar) return;
    setEstado("enviando");
    setMsg("");
    const r = await enviarDelivery(
      carrito.lineas.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
      datos,
      claveRef.current,
      cupon?.codigo
    );
    if (r.ok) {
      setEstado("ok");
      setResumen({ total: r.total ?? total, minutos: r.tiempoEstimadoMin ?? envio ? 45 : 45 });
    } else {
      setEstado("error");
      setMsg(r.faltantes?.length ? `${r.mensaje} (${r.faltantes.join(", ")})` : r.mensaje);
    }
  }

  if (estado === "ok") {
    return (
      <div className="form-ok page-enter-scale" role="status" aria-live="polite">
        <div style={{ fontSize: "3rem" }} aria-hidden="true">🛵</div>
        <h2 ref={confirmacionRef} tabIndex={-1}>¡Pedido en camino!</h2>
        <p>
          Total <strong>{formatCurrency(resumen?.total ?? total)}</strong>. Llega en aproximadamente{" "}
          <strong>{resumen?.minutos ?? zona?.tiempoEstimadoMin} min</strong>. Te llamamos si hace falta.
        </p>
        <Link href="/" className="pop-btn pop-btn-purple">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      {/* Menú */}
      <div>
        <h2 className="menu-cat-title" style={{ fontSize: "1.4rem" }}>Elegí qué pedir</h2>
        {loading && <p className="form-note">Cargando la carta…</p>}
        <div className="mt-3 space-y-6">
          {(data?.carta ?? []).filter((c) => c.productos.length).map((c) => (
            <section key={c.id}>
              <h3 className="mb-2 font-semibold">{c.nombre}</h3>
              <ul className="space-y-2">
                {c.productos.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-white p-3">
                    <div className="min-w-0">
                      <div className="font-medium">{p.nombre}</div>
                      {p.descripcion && <div className="text-xs text-zinc-500">{p.descripcion}</div>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm tabular-nums">{formatCurrency(p.precio)}</span>
                      <button onClick={() => carrito.cambiar(p.id, -1)} disabled={!carrito.cantidades[p.id]}
                        aria-label={`Quitar una unidad de ${p.nombre}`}
                        className="h-8 w-8 rounded-lg bg-zinc-100 text-lg leading-none disabled:opacity-40">−</button>
                      <span className="w-5 text-center text-sm tabular-nums" aria-live="polite">{carrito.cantidades[p.id] ?? 0}</span>
                      <button onClick={() => carrito.cambiar(p.id, 1)}
                        aria-label={`Agregar una unidad de ${p.nombre}`}
                        className="h-8 w-8 rounded-lg bg-black text-lg leading-none text-white">+</button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {/* Datos + resumen */}
      <div className="space-y-3">
        <div className="form-pop">
          <div className="field-pop">
            <label htmlFor="delivery-nombre">Nombre</label>
            <input id="delivery-nombre" value={datos.nombre} onChange={set("nombre")} placeholder="Tu nombre" />
          </div>
          <div className="field-pop">
            <label htmlFor="delivery-telefono">Teléfono</label>
            <input id="delivery-telefono" value={datos.telefono} onChange={set("telefono")} placeholder="11 5555 5555" />
          </div>
          <div className="field-pop">
            <label htmlFor="delivery-direccion">Dirección de entrega</label>
            <input id="delivery-direccion" value={datos.direccion} onChange={set("direccion")} placeholder="Calle, número, piso, timbre" />
          </div>
          <div className="field-pop">
            <label htmlFor="delivery-zona">Zona</label>
            <select id="delivery-zona" value={datos.zonaId} onChange={set("zonaId")}>
              <option value="">Elegí tu zona</option>
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre} · envío {formatCurrency(z.costoEnvio)} · {z.tiempoEstimadoMin} min
                </option>
              ))}
            </select>
            {zonasError && <p className="form-note">No pudimos cargar las zonas. Llamanos: {SITE.contacto.telefono}</p>}
          </div>
          <div className="field-pop">
            <label htmlFor="delivery-notas">Comentarios (opcional)</label>
            <textarea id="delivery-notas" rows={2} value={datos.notas} onChange={set("notas")} placeholder="Sin picante, tocar timbre…" />
          </div>
        </div>

        {carrito.totalItems > 0 && (
          <CuponInput
            tenant={SITE.tenantSlug}
            subtotal={carrito.totalMonto}
            aplicado={cupon}
            onAplicar={(codigo, d) => setCupon({ codigo, descuento: d })}
            onQuitar={() => setCupon(null)}
          />
        )}

        <div className="rounded-2xl border-2 border-black bg-white p-4 text-sm">
          <Fila label={`Subtotal (${carrito.totalItems} ítem)`} valor={carrito.totalMonto} />
          {descuento > 0 && <Fila label="Descuento" valor={-descuento} />}
          <Fila label="Envío" valor={envio} />
          <div className="mt-1 flex justify-between border-t-2 border-black pt-1 font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {estado === "error" && <p className="form-error" role="alert">{msg}</p>}

        <button onClick={enviar} disabled={!puedeEnviar || estado === "enviando"} className="pop-btn pop-btn-red w-full">
          {estado === "enviando" ? "Enviando…" : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
}

function Fila({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span>{formatCurrency(valor)}</span>
    </div>
  );
}
