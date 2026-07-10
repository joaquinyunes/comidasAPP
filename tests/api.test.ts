import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/auth/login/route";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "test-secret";

describe("Auth API", () => {
  const testTenantId = "test-tenant-" + Date.now();
  const testUserId = "test-user-" + Date.now();
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password123";

  beforeAll(async () => {
    await prisma.tenant.create({
      data: {
        id: testTenantId,
        nombre: "Test Tenant",
        slug: "test-tenant",
        plan: "basico",
        activo: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.tenant.delete({ where: { id: testTenantId } });
  });

  describe("POST /api/auth/login - Register", () => {
    it("should register a new user", async () => {
      const request = new NextRequest("http://localhost/api/auth/login/register", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          nombre: "Test User",
          tenantId: testTenantId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.nombre).toBe("Test User");
    });

    it("should reject duplicate email", async () => {
      const request = new NextRequest("http://localhost/api/auth/login/register", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          nombre: "Test User 2",
          tenantId: testTenantId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain("ya está registrado");
    });

    it("should reject invalid email", async () => {
      const request = new NextRequest("http://localhost/api/auth/login/register", {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email",
          password: testPassword,
          nombre: "Test User",
          tenantId: testTenantId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Datos inválidos");
    });

    it("should reject short password", async () => {
      const request = new NextRequest("http://localhost/api/auth/login/register", {
        method: "POST",
        body: JSON.stringify({
          email: "new@example.com",
          password: "123",
          nombre: "Test User",
          tenantId: testTenantId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Datos inválidos");
    });
  });

  describe("POST /api/auth/login - Login", () => {
    it("should login with valid credentials", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
    });

    it("should reject invalid password", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: "wrongpassword",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Credenciales inválidas");
    });

    it("should reject non-existent user", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: testPassword,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Credenciales inválidas");
    });
  });

  describe("DELETE /api/auth/login - Logout", () => {
    it("should clear token cookie", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "DELETE",
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

describe("Validation Schemas", () => {
  it("should validate MesaSchema", async () => {
    const { MesaSchema, validateInput } = await import("@/lib/validation");

    const validMesa = {
      numero: "1",
      capacidad: 4,
      sectorId: "550e8400-e29b-41d4-a716-446655440000",
    };

    const result = validateInput(MesaSchema, validMesa);
    expect(result.success).toBe(true);
  });

  it("should reject invalid MesaSchema", async () => {
    const { MesaSchema, validateInput } = await import("@/lib/validation");

    const invalidMesa = {
      numero: "",
      capacidad: -1,
      sectorId: "not-a-uuid",
    };

    const result = validateInput(MesaSchema, invalidMesa);
    expect(result.success).toBe(false);
    expect(result.errors).toContain("numero: String must contain at least 1 character(s)");
  });

  it("should validate ReservaSchema", async () => {
    const { ReservaSchema, validateInput } = await import("@/lib/validation");

    const validReserva = {
      clienteNombre: "Juan Pérez",
      clienteTelefono: "+54 11 1234-5678",
      fecha: "2026-07-15",
      hora: "20:00",
      cantidadPersonas: 4,
    };

    const result = validateInput(ReservaSchema, validReserva);
    expect(result.success).toBe(true);
  });

  it("should validate IngredienteSchema", async () => {
    const { IngredienteSchema, validateInput } = await import("@/lib/validation");

    const validIngrediente = {
      nombre: "Harina",
      unidadMedida: "kg",
      costoUnitario: 100,
      stockMinimo: 10,
      stockMaximo: 100,
    };

    const result = validateInput(IngredienteSchema, validIngrediente);
    expect(result.success).toBe(true);
  });

  it("should validate EmpleadoSchema", async () => {
    const { EmpleadoSchema, validateInput } = await import("@/lib/validation");

    const validEmpleado = {
      usuarioId: "550e8400-e29b-41d4-a716-446655440000",
      sucursalId: "550e8400-e29b-41d4-a716-446655440001",
      cargo: "Mozo",
    };

    const result = validateInput(EmpleadoSchema, validEmpleado);
    expect(result.success).toBe(true);
  });
});

describe("Utils", () => {
  it("should sanitize strings", async () => {
    const { sanitizeString } = await import("@/lib/validation");

    expect(sanitizeString("<script>alert(1)</script>")).toBe("<script>alert(1)</script>");
    expect(sanitizeString('"hello"')).toBe(""hello"");
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("should validate UUIDs", async () => {
    const { isValidUUID } = await import("@/lib/validation");

    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidUUID("not-a-uuid")).toBe(false);
    expect(isValidUUID("")).toBe(false);
  });

  it("should check rate limits", async () => {
    const { checkRateLimit } = await import("@/lib/validation");

    const key = "test-rate-limit";
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(true);
    expect(checkRateLimit(key, 5, 60000)).toBe(false);
  });
});