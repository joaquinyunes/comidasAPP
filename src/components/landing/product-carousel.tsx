"use client";

interface CarouselItem {
  nombre: string;
  precio: string;
  desc: string;
  cat: string;
  img: string;
}

const items: CarouselItem[] = [
  // Pizzas Clasicas
  { nombre: "Margherita", precio: "$185", desc: "Salsa San Marzano, mozzarella de bufala, albahaca fresca", cat: "Clasica", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80" },
  { nombre: "Pepperoni", precio: "$210", desc: "Doble capa de pepperoni artesanal, mozzarella, oregano", cat: "Clasica", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80" },
  { nombre: "Cuatro Quesos", precio: "$225", desc: "Mozzarella, gorgonzola, parmesano, fontina", cat: "Clasica", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80" },
  { nombre: "Hawaiana", precio: "$215", desc: "Jamon serrano, piña caramelizada, mozzarella", cat: "Clasica", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80" },
  // Especiales
  { nombre: "Diavola", precio: "$240", desc: "Salami picante calabres, nduja, chile rojo, miel de maguey", cat: "Especial", img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80" },
  { nombre: "Trufa Negra", precio: "$320", desc: "Crema de trufa negra, setas silvestres, rúcula fresca", cat: "Especial", img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80" },
  { nombre: "Barbacoa", precio: "$265", desc: "Res deshebrada 12hrs, cebolla caramelizada, BBQ ahumada", cat: "Especial", img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&q=80" },
  { nombre: "Hongo & Prosciutto", precio: "$285", desc: "Prosciutto di Parma, portobello, trufa, balsamico", cat: "Especial", img: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=500&q=80" },
  // Napolitana
  { nombre: "Marinara", precio: "$170", desc: "Salsa San Marzano, ajo, orégano, albahaca", cat: "Napolitana", img: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80" },
  { nombre: "Bufalina", precio: "$255", desc: "Tomate cherry, mozzarella de bufala, albahaca, EVO", cat: "Napolitana", img: "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=500&q=80" },
  { nombre: "Calzone", precio: "$235", desc: "Masa doblada rellena de mozzarella, ricotta, jamon", cat: "Napolitana", img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&q=80" },
  // Entradas
  { nombre: "Bruschetta", precio: "$125", desc: "Pan rustico tostado, tomate fresco, albahaca, ajo", cat: "Entrada", img: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&q=80" },
  { nombre: "Carpaccio", precio: "$185", desc: "Res en laminas, rúcula, parmesano, limon, trufa", cat: "Entrada", img: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&q=80" },
  { nombre: "Burrata", precio: "$195", desc: "Burrata cremosa, tomate heirloom, pesto, pan de cristal", cat: "Entrada", img: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&q=80" },
  // Bebidas
  { nombre: "Limonada", precio: "$55", desc: "Limonada natural con hierbabuena, miel", cat: "Bebida", img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80" },
  { nombre: "Cerveza Artesanal", precio: "$85", desc: "IPA o Stout de la casa, servida en vaso frio", cat: "Bebida", img: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&q=80" },
  { nombre: "Vino Tinto", precio: "$320", desc: "Copa de Malbec argentino, frutos rojos y especias", cat: "Bebida", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&q=80" },
];

const catColors: Record<string, string> = {
  Clasica: "var(--ember-2)",
  Especial: "var(--gold)",
  Napolitana: "#c084fc",
  Entrada: "#34d399",
  Bebida: "#60a5fa",
};

export default function ProductCarousel() {
  const doubled = [...items, ...items];

  return (
    <section className="carousel-section">
      <div className="carousel-head reveal">
        <span className="eyebrow">Lo que puedes pedir</span>
        <h2>
          Todo nuestro{" "}
          <span className="font-accent">menu</span>
        </h2>
      </div>

      <div className="carousel-track-wrapper">
        <div className="carousel-track">
          {doubled.map((item, i) => (
            <div key={`${item.nombre}-${i}`} className="carousel-card">
              <div className="carousel-card-img">
                <img src={item.img} alt={item.nombre} loading="lazy" />
                <span
                  className="carousel-card-cat"
                  style={{ color: catColors[item.cat] || "var(--gold)" }}
                >
                  {item.cat}
                </span>
              </div>
              <div className="carousel-card-body">
                <div className="carousel-card-top">
                  <span className="carousel-card-name">{item.nombre}</span>
                  <span className="carousel-card-price">{item.precio}</span>
                </div>
                <p className="carousel-card-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
