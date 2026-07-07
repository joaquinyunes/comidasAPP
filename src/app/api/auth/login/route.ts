import { NextResponse } from "next/server";

// ============================================
// POST /api/auth/login
// ============================================
export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // TODO: Verificar con Prisma + bcrypt
  // Por ahora, mock de demo
  if (email === "admin@restaurante.com" && password === "admin123") {
    const token = `demo-token-${Date.now()}`;
    const refreshToken = `demo-refresh-${Date.now()}`;

    return NextResponse.json({
      token,
      refreshToken,
      user: {
        id: "demo-user",
        email,
        nombre: "Admin Demo",
        roles: ["dueño"],
        tenantId: "demo-tenant",
        sucursalId: "demo-sucursal",
      },
    });
  }

  return NextResponse.json(
    { error: "Credenciales inválidas" },
    { status: 401 }
  );
}
