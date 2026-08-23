"use client";

import { useState } from "react";
import Link from "next/link";
import SiteChrome from "@/components/landing/site-chrome";
import { ImagenThumb } from "@/components/landing/Imagen";
import { useLandingData } from "@/lib/landing-data";

const PICANTE = ["", "🌶", "🌶🌶", "🌶🌶🌶"];

export default function MenuPage() {
  const { data, loading, error } = useLandingData();
  const [activa, setActiva] = useState<string | null>(null);

  const cats = data?.carta.filter((c) => c.productos.length > 0) ?? [];

  return (
    <SiteChrome
      eyebrow="La carta"
      title={<>Nuestra <span>galaxia</span> de sabores</>}
      intro="Todo se prepara al momento con ingredientes frescos. Precios en pesos, con impuestos incluidos."
    >
      {loading && <p className="form-note">Cargando la carta…</p>}

      {error && (
        <p className="form-note">
          No pudimos cargar la carta ahora. Escribinos o{" "}
          <Link href="/ordenar" style={{ textDecoration: "underline" }}>hacé tu pedido acá</Link>.
        </p>
      )}

      {!loading && !error && cats.length === 0 && (
        <p className="form-note">Estamos actualizando la carta. Volvé en un rato.</p>
      )}

      {cats.length > 0 && (
        <>
          <nav className="menu-cats" aria-label="Categorías">
            {cats.map((c) => (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                className={`menu-cat-btn ${activa === c.id ? "active" : ""}`}
                onClick={() => setActiva(c.id)}
              >
                {c.nombre}
              </a>
            ))}
          </nav>

          {cats.map((c) => (
            <section key={c.id} id={`cat-${c.id}`} className="menu-cat-block">
              <h2 className="menu-cat-title">{c.nombre}</h2>
              {c.descripcion && <p className="menu-cat-desc">{c.descripcion}</p>}
              <div className="menu-items">
                {c.productos.map((p) => (
                  <article className="menu-item" key={p.id}>
                    {p.imagenUrl && (
                      <ImagenThumb className="menu-item-img" src={p.imagenUrl} alt={p.nombre} />
                    )}
                    <div className="menu-item-main">
                      <div className="menu-item-top">
                        <h3 className="menu-item-name">{p.nombre}</h3>
                        <span className="menu-item-price">${Math.round(p.precio).toLocaleString("es-AR")}</span>
                      </div>
                      {p.descripcion && <p className="menu-item-desc">{p.descripcion}</p>}
                      <div className="menu-item-meta">
                        {p.nivelPicante ? (
                          <span className="menu-item-tag">{PICANTE[Math.min(p.nivelPicante, 3)]}</span>
                        ) : null}
                        {p.tiempoPreparacionMin ? (
                          <span className="menu-item-tag">{p.tiempoPreparacionMin} min</span>
                        ) : null}
                        {p.alergenos?.map((a) => (
                          <span className="menu-item-tag" key={a}>{a}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      <div style={{ marginTop: 48 }}>
        <Link href="/ordenar" className="pop-btn pop-btn-red">Ordenar ahora</Link>
      </div>
    </SiteChrome>
  );
}
