"use client";

import Link from "next/link";

const LOCATIONS = [
  { name: "Palermo", color: "var(--red)" },
  { name: "Villa Crespo", color: "var(--purple)" },
];

const MARKERS = [
  { top: "22%", left: "32%" },
  { top: "52%", left: "64%" },
  { top: "70%", left: "28%" },
];

export default function WhereToFind() {
  return (
    <section className="where-section" id="ubicaciones">
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
        <span
          className="font-body reveal-up"
          style={{
            fontWeight: 600,
            fontSize: "0.85rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--red)",
          }}
        >
          Ubicaciones
        </span>
        <h2
          className="font-display reveal-up"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", marginTop: 12, color: "var(--black)" }}
        >
          Dónde <span style={{ color: "var(--purple)" }}>encontrarnos</span>
        </h2>
      </div>

      <div className="where-maps">
        {LOCATIONS.map((loc) => (
          <div key={loc.name} className="where-map reveal-scale">
            <div className="where-map-circle" style={{ background: loc.color }}>
              {MARKERS.map((m, i) => (
                <div key={i} className="where-marker" style={{ top: m.top, left: m.left }}>
                  ✦
                </div>
              ))}
            </div>
            <div className="where-map-label" style={{ color: "var(--black)" }}>
              {loc.name}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 56 }} className="reveal-up">
        <Link href="/ubicaciones" className="pop-btn pop-btn-yellow">
          Ver horarios y direcciones
        </Link>
      </div>
    </section>
  );
}
