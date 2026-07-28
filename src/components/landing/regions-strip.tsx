"use client";

const regions = [
  { name: "Roma Norte", addr: "Av. Insurgentes 234", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80" },
  { name: "Condesa", addr: "Michoacan 89", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" },
  { name: "Polanco", addr: "Horacio 156", img: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80" },
  { name: "Coyoacan", addr: "Miguel Angel 45", img: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&q=80" },
  { name: "Santa Fe", addr: "Juan Salvador Agraz 78", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80" },
  { name: "Juarez", addr: "Donato Guerra 12", img: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80" },
];

export default function RegionsStrip() {
  return (
    <section id="regions" className="regions">
      <div className="section-head reveal">
        <span className="eyebrow">Sucursales</span>
        <h2>Te esperamos</h2>
      </div>
      <div className="regions-track">
        {regions.map((r) => (
          <div key={r.name} className="region-card">
            <div className="ph">
              <img src={r.img} alt={r.name} loading="lazy" />
            </div>
            <div className="font-mono">{r.name}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "4px" }}>
              {r.addr}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
