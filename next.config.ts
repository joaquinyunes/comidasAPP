import type { NextConfig } from "next";
import { cabecerasCsp, modoCsp } from "./src/config/csp";
import { patronesImagenes } from "./src/config/imagenes";

// CSP: política e interruptor reporte/bloqueo en src/config/csp.ts (variable CSP_MODO).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ...cabecerasCsp(modoCsp(process.env.CSP_MODO)),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Fotos externas: solo los dominios de IMAGENES_HOSTS (ver src/config/imagenes.ts).
    remotePatterns: patronesImagenes(process.env.IMAGENES_HOSTS),
  },
};

export default nextConfig;
