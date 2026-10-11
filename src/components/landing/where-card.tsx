"use client";

import Link from "next/link";
import type { Local } from "@/config/locales";
import WhereMap from "./where-map";

// Tarjeta de un local: mapa ilustrado animado + datos + cómo llegar.
export default function WhereCard({ local, variante }: { local: Local; variante: "a" | "b" }) {
  const mapa = `https://www.google.com/maps/search/${encodeURIComponent(local.direccion)}`;
  return (
    <article className="donde-tarjeta reveal-scale" data-variante={variante}>
      <div className="donde-mapa-caja">
        <WhereMap variante={variante} nombre={local.nombre} />
        <span className="donde-etiqueta">Local {variante === "a" ? "01" : "02"}</span>
      </div>
      <div className="donde-cuerpo">
        <h3 className="donde-nombre font-display">{local.nombre}</h3>
        <p className="donde-direccion">{local.direccion}</p>
        <p className="donde-horario">Lun a Jue 12–00 · Vie y Sáb 12–02 · Dom 18–00</p>
        <div className="donde-acciones">
          <a className="pop-btn pop-btn-yellow donde-boton" href={mapa} target="_blank" rel="noopener noreferrer">
            Cómo llegar
          </a>
          <Link className="donde-enlace" href="/ubicaciones">
            Horarios completos
          </Link>
        </div>
      </div>
    </article>
  );
}
