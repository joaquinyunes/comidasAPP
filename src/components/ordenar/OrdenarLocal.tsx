"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ImagenThumb } from "@/components/landing/Imagen";
import BotonCamara from "@/components/producto-camara/BotonCamara";
import { useLandingData } from "@/lib/landing-data";
import { useCarrito, type ItemMenu } from "@/components/cliente/useCarrito";
import CuponInput from "@/components/cliente/CuponInput";
import { SITE } from "@/config/site";
import { enviarLocal, nuevaClave, type DatosLocal } from "./enviarLocal";
import CategoriaAcordeon from "./CategoriaAcordeon";

export default function OrdenarLocal({ codigoQr }: { codigoQr: string }) {
  const { data, loading } = useLandingData();

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
          imagenUrl: p.imagenUrl ?? null,
        }))
      ),
    [data]
  );
  const carrito = useCarrito(catalogo);

  const [datos, setDatos] = useState<DatosLocal>({ referencia: "", notas: "" });
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number } | null>(null);
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const claveRef = useRef(nuevaClave());
  const confirmacionRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (estado === "ok") confirmacionRef.current?.focus();
  }, [estado]);

  const descuento = cupon?.descuento ?? 0;
  const total = Math.max(0, carrito.totalMonto - descuento);
  const puedeEnviar = carrito.totalItems > 0 && datos.referencia.trim().length >= 1;

  const set = (k: keyof DatosLocal) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDatos({ ...datos, [k]: e.target.value });

  async function enviar() {
    if (!puedeEnviar) return;
    setEstado("enviando");
    setMsg("");
    const r = await enviarLocal(
      carrito.lineas.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
      datos,
      claveRef.current,
      codigoQr,
      cupon?.codigo
    );
    if (r.ok) {
      setEstado("ok");
    } else {
      setEstado("error");
      setMsg(r.faltantes?.length ? `${r.mensaje} (${r.faltantes.join(", ")})` : r.mensaje);
    }
  }

  if (estado === "ok") {
    return (
      <div className="form-ok page-enter-scale" role="status" aria-live="polite">
        <div style={{ fontSize: "3rem" }} aria-hidden="true">🛎️</div>
        <h2 ref={confirmacionRef} tabIndex={-1}>¡Pedido enviado a cocina!</h2>
        <p>
          Total <strong>{formatCurrency(total)}</strong>. Te lo llevamos a <strong>{datos.referencia}</strong>.
        </p>
        <Link href="/" className="pop-btn pop-btn-purple">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <div>
        <h2 className="menu-cat-title" style={{ fontSize: "1.4rem" }}>Elegí qué pedir</h2>
        {loading && <p className="form-note">Cargando la carta…</p>}
        <div className="mt-3">
          {(data?.carta ?? []).filter((c) => c.productos.length).map((c) => (
            <CategoriaAcordeon key={c.id} nombre={c.nombre}>
              <ul className="flex flex-col gap-2">
                {c.productos.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-white p-3">
                    <div className="cam-thumb">
                      {p.imagenUrl && (
                        <ImagenThumb className="rounded-lg" src={p.imagenUrl} alt={p.nombre} size={56} />
                      )}
                      <BotonCamara producto={p} variante="miniatura" />
                    </div>
                    <div className="min-w-0 flex-1">
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
            </CategoriaAcordeon>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="form-pop">
          <div className="field-pop">
            <label htmlFor="local-referencia">Número de mesa o nombre del mozo</label>
            <input id="local-referencia" value={datos.referencia} onChange={set("referencia")} placeholder="Mesa 5, o el nombre de tu mozo" />
          </div>
          <div className="field-pop">
            <label htmlFor="local-notas">Comentarios (opcional)</label>
            <textarea id="local-notas" rows={2} value={datos.notas} onChange={set("notas")} placeholder="Sin picante, para compartir…" />
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

        <div className="rounded-2xl border-2 border-black bg-white p-5 text-sm">
          <div className="flex flex-col gap-2">
            <Fila label={`Subtotal (${carrito.totalItems} ítem)`} valor={carrito.totalMonto} />
            {descuento > 0 && <Fila label="Descuento" valor={-descuento} />}
          </div>
          <div className="mt-3 flex justify-between border-t-2 border-black pt-3 font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {estado === "error" && <p className="form-error" role="alert">{msg}</p>}

        <button onClick={enviar} disabled={!puedeEnviar || estado === "enviando"} className="pop-btn pop-btn-red w-full">
          {estado === "enviando" ? "Enviando…" : "Enviar a cocina"}
        </button>
      </div>
    </div>
  );
}

function Fila({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-zinc-500">{label}</span>
      <span>{formatCurrency(valor)}</span>
    </div>
  );
}
