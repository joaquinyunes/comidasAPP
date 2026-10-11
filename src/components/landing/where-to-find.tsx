"use client";

import Link from "next/link";
import { LOCALES } from "@/config/locales";
import WhereCard from "./where-card";

// Sección "Dónde encontrarnos": un mapa ilustrado animado por local.
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

      <div className="donde-grilla">
        {LOCALES.map((local, i) => (
          <WhereCard key={local.id} local={local} variante={i % 2 === 0 ? "a" : "b"} />
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
