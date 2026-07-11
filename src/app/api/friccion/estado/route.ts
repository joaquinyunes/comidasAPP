import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth-context";
import { NextRequest } from "next/server";

// ============================================
// GET /api/friccion/estado — Health check para modo offline/LAN
// ============================================
export async function GET(request: NextRequest) {
  const context = await getTenantContext(request);
  return NextResponse.json({
    online: true,
    serverTime: new Date().toISOString(),
    autenticado: !!context,
    tenantId: context?.tenantId ?? null,
  });
}
