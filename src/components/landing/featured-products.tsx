"use client";

import Link from "next/link";
import { Sticker } from "./ui";
import { Imagen } from "./Imagen";
import BotonCamara from "@/components/producto-camara/BotonCamara";
import { useLandingData, type ProductoLanding } from "@/lib/landing-data";

const TAG_COLORS = ["#F6BE3B", "#8F57F2", "#EF4136", "#F89B28"];

const FALLBACK: ProductoLanding[] = [
  { id: "f1", nombre: "Galaxy Bite", descripcion: "Carne angus, cheddar, salsa especial en pan cósmico.", precio: 185, imagenUrl: "/assets/galaxy-bite.png", alergenos: [], destacado: true, tamanoCm: 30, pesoGr: 320, incluye: ["Carne angus", "Cheddar", "Salsa especial", "Pan cósmico"] },
  { id: "f2", nombre: "Hyperdog", descripcion: "Salchicha premium, cebolla crispy, mostaza y ketchup.", precio: 165, imagenUrl: "/assets/hyperdog.png", alergenos: [], destacado: true, tamanoCm: 30, pesoGr: 260, incluye: ["Salchicha premium", "Cebolla crispy", "Mostaza", "Ketchup"] },
  { id: "f3", nombre: "Pizzanaut", descripcion: "Masa artesanal, mozzarella, pepperoni y orégano.", precio: 195, imagenUrl: "/assets/pizzanaut.png", alergenos: [], destacado: true, tamanoCm: 32, pesoGr: 820, incluye: ["Masa artesanal", "Mozzarella", "Pepperoni", "Orégano", "8 porciones"] },
  { id: "f4", nombre: "Meteor Empanada", descripcion: "Masa dorada y crocante, relleno jugoso recién horneado.", precio: 95, imagenUrl: "/assets/meteor-empanada.png", alergenos: [], destacado: true, tamanoCm: 28, pesoGr: 110, incluye: ["Masa dorada", "Relleno jugoso", "Al horno"] },
  { id: "f5", nombre: "Comet Fries", descripcion: "Papas cortadas a mano con salsa nebulosa de la casa.", precio: 110, imagenUrl: "/assets/comet-fries.png", alergenos: [], destacado: false, tamanoCm: 26, pesoGr: 300, incluye: ["Papas cortadas a mano", "Salsa nebulosa"] },
  { id: "f6", nombre: "Nebula Soda", descripcion: "Bebida cósmica bien fría, ideal para acompañar cualquier misión.", precio: 75, imagenUrl: "/assets/nebula-soda.png", alergenos: [], destacado: false, tamanoCm: 24, pesoGr: 450, incluye: ["Bebida cósmica", "Bien fría"] },
];

export default function FeaturedProducts() {
  const { data } = useLandingData();

  const productos = (() => {
    if (!data) return FALLBACK;
    const todos = data.carta.flatMap((c) => c.productos);
    const destacados = todos.filter((p) => p.destacado);
    const lista = (destacados.length >= 3 ? destacados : todos).slice(0, 6);
    return lista.length ? lista : FALLBACK;
  })();

  return (
    <section className="products-section" id="menu">
      <div className="products-head">
        <Sticker label="Saboriza tu misión" color="purple" className="products-eyebrow" />
        <h2 className="font-display section-title-head reveal-up">
          Nuestra <span style={{ color: "var(--red)" }}>galaxia</span>
        </h2>
        <p className="products-sub reveal-up">
          Elegí tu destino y dejá que tus papilas viajen por el universo.
        </p>
      </div>

      <div className="products-grid">
        {productos.map((p, i) => (
          <article className="product-card pop-card reveal-scale" key={p.id} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="product-img">
              {p.destacado && (
                <div className="product-tag" style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}>
                  Destacado
                </div>
              )}
              <Imagen src={p.imagenUrl || "/assets/galaxy-bite.png"} alt={p.nombre} />
              <BotonCamara producto={p} variante="flotante" />
            </div>
            <div className="product-body">
              <h3 className="font-display product-name">{p.nombre}</h3>
              {p.descripcion && <p className="product-ingredients-text">{p.descripcion}</p>}
              <div className="product-foot">
                <span className="product-price">${Math.round(p.precio).toLocaleString("es-AR")}</span>
                <Link href="/ordenar" className="pop-btn product-order">
                  Ordenar
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="products-more reveal-up">
        <Link href="/menu" className="pop-btn pop-btn-purple">
          Ver la carta completa
        </Link>
      </div>
    </section>
  );
}
