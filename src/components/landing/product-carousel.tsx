"use client";

interface CarouselItem {
  nombre: string;
  precio: string;
  desc: string;
  cat: string;
  img: string;
}

const items: CarouselItem[] = [
  { nombre: "Margherita", precio: "$185", desc: "Salsa San Marzano, mozzarella de bufala, albahaca fresca, aceite EVO", cat: "Clasica", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80" },
  { nombre: "Pepperoni", precio: "$210", desc: "Doble capa de pepperoni artesanal, mozzarella, oregano, salsa casera", cat: "Clasica", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80" },
  { nombre: "Cuatro Quesos", precio: "$225", desc: "Mozzarella, gorgonzola, parmesano, fontina, crema de ajo", cat: "Clasica", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80" },
  { nombre: "Hawaiana", precio: "$215", desc: "Jamon serrano, piña caramelizada al horno, mozzarella, bechamel", cat: "Clasica", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80" },
  { nombre: "Diavola", precio: "$240", desc: "Salami picante calabres, nduja, chile rojo, miel de maguey", cat: "Especial", img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=80" },
  { nombre: "Trufa Negra", precio: "$320", desc: "Crema de trufa negra, setas silvestres, parmesano, rúcula fresca", cat: "Especial", img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&q=80" },
  { nombre: "Barbacoa", precio: "$265", desc: "Res deshebrada 12hrs, cebolla caramelizada, BBQ ahumada, cilantro", cat: "Especial", img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80" },
  { nombre: "Prosciutto e Funghi", precio: "$285", desc: "Prosciutto di Parma, portobello, trufa, reduccion de balsamico", cat: "Especial", img: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&q=80" },
  { nombre: "Marinara", precio: "$170", desc: "Salsa San Marzano, ajo, orégano, albahaca — la mas pura de Napoles", cat: "Napolitana", img: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&q=80" },
  { nombre: "Bufalina", precio: "$255", desc: "Tomate cherry, mozzarella de bufala, albahaca, aceite EVO", cat: "Napolitana", img: "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=600&q=80" },
  { nombre: "Calzone Relleno", precio: "$235", desc: "Masa doblada rellena de mozzarella, ricotta, jamon, champiñones", cat: "Napolitana", img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80" },
  { nombre: "Bruschetta", precio: "$125", desc: "Pan rustico tostado, tomate fresco, albahaca, ajo, aceite EVO", cat: "Entrada", img: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80" },
  { nombre: "Carpaccio de Res", precio: "$185", desc: "Laminas de res, rúcula, parmesano, limon, aceite de trufa", cat: "Entrada", img: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&q=80" },
  { nombre: "Burrata", precio: "$195", desc: "Burrata cremosa, tomate heirloom, pesto, pan de cristal", cat: "Entrada", img: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&q=80" },
  { nombre: "Limonada Natural", precio: "$55", desc: "Limonada fresca con hierbabuena, endulzada con miel", cat: "Bebida", img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=80" },
  { nombre: "Cerveza Artesanal", precio: "$85", desc: "IPA o Stout de la casa, servida en vaso bien frio", cat: "Bebida", img: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=80" },
  { nombre: "Vino Tinto", precio: "$320", desc: "Copa de Malbec argentino, notas de frutos rojos y especias", cat: "Bebida", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80" },
];

const catColors: Record<string, string> = {
  Clasica: "#e8752c",
  Especial: "#e3a857",
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
                  style={{ color: catColors[item.cat] || "#e3a857" }}
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
