import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://cozizina.com").replace(/\/$/, "");

const RUTAS = ["", "/menu", "/reservar", "/ordenar", "/nosotros", "/ubicaciones", "/terminos", "/privacidad"];

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  return RUTAS.map((ruta) => ({
    url: `${BASE}${ruta}`,
    lastModified: ahora,
    changeFrequency: ruta === "" || ruta === "/menu" ? "weekly" : "monthly",
    priority: ruta === "" ? 1 : ruta === "/menu" ? 0.9 : 0.6,
  }));
}
