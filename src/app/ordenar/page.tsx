"use client";

import { useState } from "react";
import Link from "next/link";
import SiteChrome from "@/components/landing/site-chrome";
import { SITE } from "@/config/site";
import OrdenarDelivery from "@/components/ordenar/OrdenarDelivery";

const tel = SITE.contacto.telefono.replace(/\s/g, "");

export default function OrdenarPage() {
  const [modo, setModo] = useState<"elegir" | "delivery">("elegir");

  return (
    <SiteChrome
      eyebrow="Ordenar"
      title={<>Pedí y <span>despegá</span></>}
      intro="Envío a domicilio con reparto propio, o retiralo en el local. Todo se prepara al momento."
    >
      {modo === "delivery" ? (
        <>
          <button onClick={() => setModo("elegir")} className="mb-4 text-sm text-zinc-500 underline">
            ← Volver
          </button>
          <OrdenarDelivery />
        </>
      ) : (
        <div className="order-options">
          <div className="order-card">
            <h3>Envío a domicilio</h3>
            <p>Armá tu pedido, elegí tu zona y pagá. Reparto propio en Palermo, Villa Crespo y alrededores.</p>
            <button className="pop-btn pop-btn-red" onClick={() => setModo("delivery")}>
              Pedir delivery
            </button>
          </div>

          <div className="order-card">
            <h3>Pasá a buscarlo</h3>
            <p>Hacé tu pedido por teléfono y retiralo en el local en 15–20 minutos.</p>
            <a className="pop-btn pop-btn-yellow" href={`tel:${tel}`}>Llamar {SITE.contacto.telefono}</a>
          </div>

          <div className="order-card">
            <h3>Ya estás en el local</h3>
            <p>Escaneá el código QR del local, poné tu mesa o el nombre de tu mozo, y pedí desde tu celular.</p>
            <Link className="pop-btn pop-btn-purple" href="/pedir-local">Pedir en el local</Link>
          </div>
        </div>
      )}
    </SiteChrome>
  );
}
