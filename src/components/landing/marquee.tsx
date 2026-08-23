"use client";

const items = [
  "INGREDIENTES FRESCOS",
  "SABOR DE OTRO PLANETA",
  "ENVÍO CÓSMICO",
  "ABIERTO HASTA MEDIANOCHE",
  "HECHO AL MOMENTO",
  "BUENOS AIRES",
];

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span className="marquee-item" key={i}>
            <span className="marquee-text font-display">{item}</span>
            <span className="marquee-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}