"use client";

import { useState, useRef, useCallback } from "react";

const categories = [
  { key: "clasicas", label: "Clasicas" },
  { key: "especiales", label: "Especiales" },
  { key: "napolitana", label: "Napolitana" },
  { key: "entradas", label: "Entradas" },
  { key: "bebidas", label: "Bebidas" },
] as const;

type CatKey = (typeof categories)[number]["key"];

interface Dish {
  nombre: string;
  precio: string;
  desc: string;
  cat: CatKey;
}

const dishes: Dish[] = [
  { nombre: "Margherita", precio: "$185", desc: "Salsa San Marzano, mozzarella de bufala, albahaca fresca, aceite de oliva extra virgen.", cat: "clasicas" },
  { nombre: "Pepperoni", precio: "$210", desc: "Doble capa de pepperoni artesanal, mozzarella, oregano, salsa de tomate casera.", cat: "clasicas" },
  { nombre: "Cuatro Quesos", precio: "$225", desc: "Mozzarella, gorgonzola, parmesano, fontina. Sin salsa de tomate, solo crema de ajo.", cat: "clasicas" },
  { nombre: "Hawaiana", precio: "$215", desc: "Jamón serrano, piña caramelizada al horno, mozzarella, salsa bechamel.", cat: "clasicas" },
  { nombre: "Diavola", precio: "$240", desc: "Salami picante calabres, nduja, chile rojo, mozzarella, miel de maguey.", cat: "especiales" },
  { nombre: "Trufa Negra", precio: "$320", desc: "Crema de trufa negra, setas silvestres, mozzarella, parmesano, rúcula fresca.", cat: "especiales" },
  { nombre: "Barbacoa", precio: "$265", desc: "Res deshebrada 12hrs, cebolla caramelizada, cilantro, mozzarella, salsa BBQ ahumada.", cat: "especiales" },
  { nombre: "Hongo & Prosciutto", precio: "$285", desc: "Prosciutto di Parma, hongos portobello, trufa, mozzarella, reduccion de balsamico.", cat: "especiales" },
  { nombre: "Marinara", precio: "$170", desc: "Salsa San Marzano, ajo, orégano, albahaca. La mas pura de Nápoles.", cat: "napolitana" },
  { nombre: "Bufalina", precio: "$255", desc: "Tomate cherry, mozzarella de bufala, albahaca, aceite EVO. Tradicion napoletana.", cat: "napolitana" },
  { nombre: "Calzone", precio: "$235", desc: "Masa doblada rellena de mozzarella, ricotta, jamon, champiñones. Horneado.", cat: "napolitana" },
  { nombre: "Bruschetta", precio: "$125", desc: "Pan rustico tostado, tomate fresco, albahaca, ajo, aceite de oliva.", cat: "entradas" },
  { nombre: "Carpaccio", precio: "$185", desc: "Res en laminas, rúcula, parmesano, limon, aceite de trufa.", cat: "entradas" },
  { nombre: "Burrata", precio: "$195", desc: "Burrata cremosa, tomate heirloom, pesto, pan de cristal.", cat: "entradas" },
  { nombre: "Limonada", precio: "$55", desc: "Limonada natural con hierbabuena, endulzada con miel.", cat: "bebidas" },
  { nombre: "Cerveza Artesanal", precio: "$85", desc: "IPA o Stout de la casa, servida en vaso frío.", cat: "bebidas" },
  { nombre: "Vino Tinto", precio: "$320", desc: "Copa de Malbec argentino, notas de frutos rojos y especias.", cat: "bebidas" },
];

export default function Carta() {
  const [active, setActive] = useState<CatKey>("clasicas");
  const filtered = dishes.filter((d) => d.cat === active);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToMenu = useCallback(() => {
    menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section id="menu" className="menu-section" ref={menuRef}>
      <div className="menu-head">
        <span className="eyebrow reveal">La carta</span>
        <h2 className="reveal">Sabores que <span className="font-accent">enamoran</span></h2>
        <div className="menu-tabs reveal">
          {categories.map((c) => (
            <button
              key={c.key}
              className={`menu-tab ${active === c.key ? "active" : ""}`}
              onClick={() => {
                setActive(c.key);
                setTimeout(scrollToMenu, 100);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="dish-grid reveal">
        {filtered.map((d) => (
          <div key={d.nombre} className="dish">
            <div className="dish-name">{d.nombre}</div>
            <div className="dish-price">{d.precio}</div>
            <div className="dish-desc">{d.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
