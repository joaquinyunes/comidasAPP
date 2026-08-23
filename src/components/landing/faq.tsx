"use client";

import { useState } from "react";
import { SectionTitle } from "./ui";

const faqs = [
  {
    q: "¿Hacen envíos a domicilio?",
    a: "Sí. Enviamos con reparto propio en la zona de nuestras sucursales. Pedí por la web o por teléfono y te llega caliente.",
  },
  {
    q: "¿Cuánto toma preparar mi pedido?",
    a: "En promedio 8 a 12 minutos. Cada plato se arma con ingredientes frescos al momento de tu pedido.",
  },
  {
    q: "¿Tienen opciones veganas?",
    a: "Sí. Tenemos pan especial, carne vegetal y salsas veganas para que nadie se quede sin su viaje.",
  },
  {
    q: "¿Puedo reservar mesa?",
    a: "Claro. Reservá desde la web en la sección Reservar o llamanos. Te confirmamos por teléfono.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Aceptamos tarjetas, transferencia y efectivo. También podés pagar desde tu mesa escaneando el QR.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq-section" id="faq">
      <div className="faq-head">
        <SectionTitle
          eyebrow="Dudas frecuentes"
          eyebrowColor="var(--red)"
          titleA="Preguntas"
          titleB="frecuentes"
          titleBColor="var(--purple)"
        />
      </div>

      <div className="faq-list">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div className={`faq-item pop-card ${isOpen ? "open" : ""}`} key={i}>
              <button className="faq-q" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                <span className="font-display faq-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="faq-question">{f.q}</span>
                <span className={`faq-icon ${isOpen ? "open" : ""}`}>{isOpen ? "−" : "+"}</span>
              </button>
              <div className="faq-answer">
                <p>{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}