"use client";

const regions = [
  { name: "Roma Norte", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80" },
  { name: "Condesa", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80" },
  { name: "Polanco", img: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=500&q=80" },
  { name: "Coyoacan", img: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=500&q=80" },
  { name: "Santa Fe", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80" },
  { name: "Juarez", img: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=500&q=80" },
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
          </div>
        ))}
      </div>
    </section>
  );
}
