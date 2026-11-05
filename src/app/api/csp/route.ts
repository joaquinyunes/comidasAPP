export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// ============================================
// POST /api/csp — reportes de la Content-Security-Policy (modo solo reporte)
// Sirve para decidir (S2) si se puede pasar a "bloquear". Solo registra qué directiva
// y qué recurso se bloquearían; sin cookies, IP ni cuerpo completo.
// ============================================

const limite = rateLimit({
  maxRequests: 30,
  windowMs: 60_000,
  keyGenerator: (r) => "csp:" + (r.headers.get("x-forwarded-for") ?? "?").split(",")[0].trim(),
});

const corto = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : undefined);

export async function POST(request: NextRequest) {
  const limitada = await limite(request);
  if (limitada) return limitada;

  const texto = (await request.text().catch(() => "")).slice(0, 8_000);
  try {
    const json = JSON.parse(texto);
    const r = json["csp-report"] ?? (Array.isArray(json) ? json[0]?.body : json?.body) ?? {};
    console.warn("[csp]", {
      directiva: corto(r["violated-directive"] ?? r.effectiveDirective),
      recurso: corto(r["blocked-uri"] ?? r.blockedURL),
      pagina: corto(r["document-uri"] ?? r.documentURL)?.split("?")[0],
    });
  } catch {
    // reporte mal formado: se ignora
  }
  return new NextResponse(null, { status: 204 });
}
